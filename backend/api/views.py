import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
from bson import ObjectId
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .db import (
    users_col,
    startup_ideas_col,
    market_research_col,
    surveys_col,
    survey_responses_col,
    competitors_col,
    financial_assumptions_col,
    risks_col,
    roadmap_tasks_col,
    reports_col,
    validation_scores_col,
    activity_logs_col,
    teams_col,
    team_memberships_col,
    to_object_id,
    serialize_doc,
    serialize_docs,
    log_activity
)
from .auth import (
    hash_password,
    check_password,
    generate_tokens,
    IsAuthenticatedMongo
)
from .ai_agents import (
    IdeaAnalysisAgent,
    MarketResearchAgent,
    CustomerValidationAgent,
    CompetitorAnalysisAgent,
    FinancialAnalysisAgent,
    RiskAssessmentAgent,
    AIOrchestrator,
    call_gemini_json
)
from .financial_simulator import run_financial_simulation
from .scoring_engine import evaluate_idea, calculate_evidence_coverage
from .report_generator import generate_pdf_report, export_survey_responses_to_csv
from .demo_data import seed_demo_startup_idea

# Helper to verify idea ownership or team membership
def check_idea_access(user_id: str, idea_id_str: str) -> Tuple[Optional[Dict[str, Any]], Optional[Response]]:
    obj_id = to_object_id(idea_id_str)
    if not obj_id:
        return None, Response({"error": "Invalid idea ID"}, status=status.HTTP_400_BAD_REQUEST)
    
    idea = startup_ideas_col().find_one({"_id": obj_id})
    if not idea:
        return None, Response({"error": "Startup idea not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Ownership or team check
    if idea.get("user_id") != str(user_id):
        # Check team membership
        membership = team_memberships_col().find_one({
            "user_id": str(user_id),
            "idea_id": str(idea_id_str)
        })
        if not membership:
            return None, Response({"error": "You are not authorized to access this startup idea"}, status=status.HTTP_403_FORBIDDEN)
            
    return idea, None


# ==========================================
# 1. AUTHENTICATION VIEWS
# ==========================================
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        name = request.data.get('name', '').strip()
        role = request.data.get('role', 'Startup Founder')

        valid_roles = ['Student', 'Startup Founder', 'Mentor', 'Incubator Administrator']
        if role not in valid_roles:
            role = 'Startup Founder'

        if not email or '@' not in email:
            return Response({'error': 'Please provide a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 6:
            return Response({'error': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = users_col().find_one({'email': email})
        if existing:
            return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        now = datetime.utcnow()
        user_doc = {
            'email': email,
            'password_hash': hash_password(password),
            'name': name or email.split('@')[0],
            'role': role,
            'created_at': now,
            'updated_at': now
        }
        res = users_col().insert_one(user_doc)
        user_doc['_id'] = res.inserted_id

        tokens = generate_tokens(user_doc)
        log_activity(str(res.inserted_id), "Register", f"User registered with role {role}")

        return Response({
            'message': 'Account created successfully',
            'user': {
                'id': str(user_doc['_id']),
                'email': user_doc['email'],
                'name': user_doc['name'],
                'role': user_doc['role'],
                'created_at': now.isoformat()
            },
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user_doc = users_col().find_one({'email': email})
        if not user_doc or not check_password(password, user_doc.get('password_hash', '')):
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        tokens = generate_tokens(user_doc)
        log_activity(str(user_doc['_id']), "Login", "User logged in")

        return Response({
            'message': 'Login successful',
            'user': {
                'id': str(user_doc['_id']),
                'email': user_doc['email'],
                'name': user_doc.get('name', ''),
                'role': user_doc.get('role', 'Startup Founder'),
                'created_at': user_doc.get('created_at', datetime.utcnow()).isoformat() if isinstance(user_doc.get('created_at'), datetime) else user_doc.get('created_at')
            },
            'tokens': tokens
        }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request):
        return Response({
            'user': request.user.to_dict()
        })

    def patch(self, request):
        user_id = request.user.id
        obj_id = to_object_id(user_id)
        updates = {}
        if 'name' in request.data:
            updates['name'] = str(request.data['name']).strip()
        if 'role' in request.data:
            valid_roles = ['Student', 'Startup Founder', 'Mentor', 'Incubator Administrator']
            if request.data['role'] in valid_roles:
                updates['role'] = request.data['role']

        if updates:
            updates['updated_at'] = datetime.utcnow()
            users_col().update_one({'_id': obj_id}, {'$set': updates})
            log_activity(user_id, "Update Profile", "Updated user profile details")

        updated_doc = users_col().find_one({'_id': obj_id})
        return Response({
            'message': 'Profile updated',
            'user': serialize_doc(updated_doc)
        })


# ==========================================
# 2. STARTUP IDEAS CRUD & DEMO SEED
# ==========================================
class StartupIdeaListCreateView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request):
        user_id = request.user.id
        # Ideas owned by user or shared via team
        ideas = list(startup_ideas_col().find({'user_id': user_id}).sort('created_at', -1))
        
        # Attach quick stats for each idea
        results = []
        for doc in ideas:
            idea_id = str(doc['_id'])
            survey_count = surveys_col().count_documents({'idea_id': idea_id})
            comp_count = competitors_col().count_documents({'idea_id': idea_id})
            latest_score = validation_scores_col().find_one({'idea_id': idea_id}, sort=[('created_at', -1)])
            
            s_doc = serialize_doc(doc)
            s_doc['survey_count'] = survey_count
            s_doc['competitor_count'] = comp_count
            s_doc['validation_score'] = latest_score.get('score_data', {}).get('overall_score') if latest_score else None
            s_doc['recommendation_band'] = latest_score.get('score_data', {}).get('recommendation_band') if latest_score else 'Not Validated'
            results.append(s_doc)

        return Response({'ideas': results})

    def post(self, request):
        data = request.data
        title = data.get('title', '').strip()
        if not title:
            return Response({'error': 'Startup name/title is required.'}, status=status.HTTP_400_BAD_REQUEST)

        now = datetime.utcnow()
        doc = {
            'user_id': request.user.id,
            'title': title,
            'industry': data.get('industry', 'Technology'),
            'problem_statement': data.get('problem_statement', ''),
            'proposed_solution': data.get('proposed_solution', ''),
            'target_customers': data.get('target_customers', ''),
            'target_geography': data.get('target_geography', ''),
            'current_alternatives': data.get('current_alternatives', ''),
            'unique_value_proposition': data.get('unique_value_proposition', ''),
            'available_budget': data.get('available_budget', ''),
            'team_skills': data.get('team_skills', ''),
            'business_model': data.get('business_model', ''),
            'development_stage': data.get('development_stage', 'Idea Phase'),
            'ai_refined_data': None,
            'created_at': now,
            'updated_at': now
        }
        res = startup_ideas_col().insert_one(doc)
        doc['_id'] = res.inserted_id

        log_activity(request.user.id, "Create Idea", f"Created startup idea '{title}'", str(res.inserted_id))
        return Response({'idea': serialize_doc(doc)}, status=status.HTTP_201_CREATED)


class StartupIdeaDetailView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        idea_id = str(idea['_id'])
        # Also fetch associated surveys, competitors, financials, latest score
        surveys = serialize_docs(list(surveys_col().find({'idea_id': idea_id})))
        competitors = serialize_docs(list(competitors_col().find({'idea_id': idea_id})))
        financials = serialize_doc(financial_assumptions_col().find_one({'idea_id': idea_id}))
        market_doc = serialize_doc(market_research_col().find_one({'idea_id': idea_id}))
        risks = serialize_docs(list(risks_col().find({'idea_id': idea_id})))
        roadmap = serialize_docs(list(roadmap_tasks_col().find({'idea_id': idea_id})))
        latest_score = serialize_doc(validation_scores_col().find_one({'idea_id': idea_id}, sort=[('created_at', -1)]))

        return Response({
            'idea': serialize_doc(idea),
            'surveys': surveys,
            'competitors': competitors,
            'financials': financials,
            'market': market_doc,
            'risks': risks,
            'roadmap': roadmap,
            'latest_score': latest_score.get('score_data') if latest_score else None
        })

    def patch(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        allowed_fields = [
            'title', 'industry', 'problem_statement', 'proposed_solution',
            'target_customers', 'target_geography', 'current_alternatives',
            'unique_value_proposition', 'available_budget', 'team_skills',
            'business_model', 'development_stage', 'ai_refined_data'
        ]
        updates = {k: v for k, v in request.data.items() if k in allowed_fields}
        if updates:
            updates['updated_at'] = datetime.utcnow()
            startup_ideas_col().update_one({'_id': idea['_id']}, {'$set': updates})
            log_activity(request.user.id, "Update Idea", f"Updated idea '{idea.get('title')}'", str(idea['_id']))

        updated_doc = startup_ideas_col().find_one({'_id': idea['_id']})
        return Response({'idea': serialize_doc(updated_doc)})

    def delete(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        idea_id = str(idea['_id'])
        # Cascade delete related artifacts
        startup_ideas_col().delete_one({'_id': idea['_id']})
        surveys_col().delete_many({'idea_id': idea_id})
        competitors_col().delete_many({'idea_id': idea_id})
        financial_assumptions_col().delete_many({'idea_id': idea_id})
        market_research_col().delete_many({'idea_id': idea_id})
        risks_col().delete_many({'idea_id': idea_id})
        roadmap_tasks_col().delete_many({'idea_id': idea_id})
        reports_col().delete_many({'idea_id': idea_id})
        validation_scores_col().delete_many({'idea_id': idea_id})

        log_activity(request.user.id, "Delete Idea", f"Deleted idea '{idea.get('title')}'")
        return Response({'message': 'Startup idea and all associated data deleted successfully'})


class DemoSeedView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def post(self, request):
        try:
            result = seed_demo_startup_idea(request.user.id)
            return Response({
                'message': 'Demo startup idea seeded successfully with full empirical dataset!',
                'demo_data': result
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f"Failed to seed demo idea: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==========================================
# 3. AI INTELLIGENCE & ORCHESTRATION
# ==========================================
class IdeaAnalyzeAIView(APIView):
    """Triggers Agent A (Idea Analysis Agent) on startup idea."""
    permission_classes = [IsAuthenticatedMongo]

    def post(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        analysis = IdeaAnalysisAgent.analyze(idea)
        # Save refined AI data to idea document
        startup_ideas_col().update_one(
            {'_id': idea['_id']},
            {'$set': {'ai_refined_data': analysis.model_dump(), 'updated_at': datetime.utcnow()}}
        )

        log_activity(request.user.id, "AI Analysis", f"Ran Idea Intelligence Agent on '{idea.get('title')}'", str(idea['_id']))
        return Response({'analysis': analysis.model_dump()})


class MarketResearchAIView(APIView):
    """Triggers Agent B (Market Research Agent) and calculates TAM/SAM/SOM."""
    permission_classes = [IsAuthenticatedMongo]

    def post(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        market_inputs = request.data or {}
        # Also check if existing market doc exists in DB
        existing = market_research_col().find_one({'idea_id': str(idea['_id'])})
        if existing and not market_inputs:
            market_inputs = serialize_doc(existing)

        analysis = MarketResearchAgent.analyze(idea, market_inputs)
        
        # Save or update market_research collection
        tam_obj = analysis.tam_sam_som_analysis
        market_doc = {
            'idea_id': str(idea['_id']),
            'tam_usd': tam_obj.get('estimated_tam_usd', 0),
            'sam_usd': tam_obj.get('estimated_sam_usd', 0),
            'som_usd': tam_obj.get('estimated_som_usd', 0),
            'analysis': analysis.model_dump(),
            'updated_at': datetime.utcnow()
        }
        market_research_col().update_one(
            {'idea_id': str(idea['_id'])},
            {'$set': market_doc},
            upsert=True
        )

        log_activity(request.user.id, "Market Intelligence", f"Ran Market Intelligence on '{idea.get('title')}'", str(idea['_id']))
        return Response({'market_research': analysis.model_dump()})


class CompetitorAnalysisAIView(APIView):
    """Triggers Agent D (Competitor Analysis Agent) on mapped competitors."""
    permission_classes = [IsAuthenticatedMongo]

    def post(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        competitors = list(competitors_col().find({'idea_id': str(idea['_id'])}))
        analysis = CompetitorAnalysisAgent.analyze(idea, serialize_docs(competitors))

        log_activity(request.user.id, "Competitor Intelligence", f"Analyzed competitors for '{idea.get('title')}'", str(idea['_id']))
        return Response({'competitor_analysis': analysis.model_dump()})


class FullValidationRunAIView(APIView):
    """Triggers the Central AI Orchestrator to run full validation report."""
    permission_classes = [IsAuthenticatedMongo]

    def post(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        idea_id = str(idea['_id'])
        surveys = list(surveys_col().find({'idea_id': idea_id}))
        survey_ids = [str(s['_id']) for s in surveys]
        responses = list(survey_responses_col().find({'survey_id': {'$in': survey_ids}}))
        competitors = list(competitors_col().find({'idea_id': idea_id}))
        financials = financial_assumptions_col().find_one({'idea_id': idea_id})
        market_doc = market_research_col().find_one({'idea_id': idea_id})

        val_report = AIOrchestrator.run_full_validation(
            idea=idea,
            surveys=serialize_docs(surveys),
            responses=serialize_docs(responses),
            competitors=serialize_docs(competitors),
            financial_inputs=serialize_doc(financials),
            market_inputs=serialize_doc(market_doc)
        )

        now = datetime.utcnow()
        # Save score
        score_doc = {
            'idea_id': idea_id,
            'score_data': val_report['validation_score'],
            'created_at': now
        }
        validation_scores_col().insert_one(score_doc)

        # Save full report
        report_doc = {
            'idea_id': idea_id,
            'title': f"Validation Dossier — {idea.get('title')}",
            'report_data': val_report,
            'created_at': now
        }
        reports_col().insert_one(report_doc)

        # Sync generated roadmap tasks if requested
        if val_report.get('roadmap_tasks'):
            for t in val_report['roadmap_tasks']:
                existing_t = roadmap_tasks_col().find_one({'idea_id': idea_id, 'title': t['title']})
                if not existing_t:
                    t_doc = dict(t)
                    t_doc['idea_id'] = idea_id
                    t_doc['created_at'] = now
                    roadmap_tasks_col().insert_one(t_doc)

        log_activity(request.user.id, "Full Validation", f"Completed full AI validation dossier for '{idea.get('title')}'", idea_id)
        return Response({'validation_report': val_report})


# ==========================================
# 4. CUSTOMER SURVEY MODULE & PUBLIC APIS
# ==========================================
class SurveyListCreateView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        surveys = list(surveys_col().find({'idea_id': str(idea['_id'])}).sort('created_at', -1))
        results = []
        for s in surveys:
            s_id = str(s['_id'])
            resp_count = survey_responses_col().count_documents({'survey_id': s_id})
            s_data = serialize_doc(s)
            s_data['response_count'] = resp_count
            results.append(s_data)
        return Response({'surveys': results})

    def post(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        data = request.data
        title = data.get('title', 'Customer Validation Survey').strip()
        questions = data.get('questions', [])

        if not questions:
            # Default standard discovery questions if none provided
            questions = [
                {
                    "id": "q1",
                    "question_text": f"How often do you encounter difficulties with {idea.get('problem_statement', 'this issue')[:60]}?",
                    "question_type": "single_choice",
                    "is_required": True,
                    "options": ["Daily", "Weekly", "Monthly", "Rarely / Never"]
                },
                {
                    "id": "q2",
                    "question_text": "What current tool or workaround do you use to deal with this?",
                    "question_type": "short_answer",
                    "is_required": True
                },
                {
                    "id": "q3",
                    "question_text": "On a scale of 1 to 5, how frustrating is this current workaround?",
                    "question_type": "rating_scale",
                    "is_required": True,
                    "scale_min": 1,
                    "scale_max": 5
                },
                {
                    "id": "q4",
                    "question_text": f"How interested would you be in a solution that provides {idea.get('proposed_solution', 'automated help')[:60]}?",
                    "question_type": "single_choice",
                    "is_required": True,
                    "options": ["Extremely interested", "Somewhat interested", "Neutral", "Not interested"]
                },
                {
                    "id": "q5",
                    "question_text": "What would be your biggest concern before adopting a new platform?",
                    "question_type": "long_answer",
                    "is_required": False
                }
            ]

        now = datetime.utcnow()
        token = uuid.uuid4().hex[:10]
        survey_doc = {
            'idea_id': str(idea['_id']),
            'user_id': request.user.id,
            'title': title,
            'description': data.get('description', 'Customer feedback survey'),
            'token': token,
            'status': data.get('status', 'published'),  # draft, published, closed
            'questions': questions,
            'created_at': now,
            'updated_at': now
        }
        res = surveys_col().insert_one(survey_doc)
        survey_doc['_id'] = res.inserted_id

        log_activity(request.user.id, "Create Survey", f"Created survey '{title}'", str(idea['_id']))
        return Response({'survey': serialize_doc(survey_doc)}, status=status.HTTP_201_CREATED)


class SurveyDetailView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid survey ID'}, status=status.HTTP_400_BAD_REQUEST)

        survey = surveys_col().find_one({'_id': obj_id})
        if not survey:
            return Response({'error': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check access to underlying idea
        idea, err = check_idea_access(request.user.id, survey.get('idea_id'))
        if err:
            return err

        resp_count = survey_responses_col().count_documents({'survey_id': str(survey['_id'])})
        s_data = serialize_doc(survey)
        s_data['response_count'] = resp_count
        return Response({'survey': s_data})

    def patch(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid survey ID'}, status=status.HTTP_400_BAD_REQUEST)

        survey = surveys_col().find_one({'_id': obj_id})
        if not survey:
            return Response({'error': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)

        idea, err = check_idea_access(request.user.id, survey.get('idea_id'))
        if err:
            return err

        updates = {}
        for f in ['title', 'description', 'status', 'questions']:
            if f in request.data:
                updates[f] = request.data[f]

        if updates:
            updates['updated_at'] = datetime.utcnow()
            surveys_col().update_one({'_id': obj_id}, {'$set': updates})
            log_activity(request.user.id, "Update Survey", f"Updated survey '{survey.get('title')}'", survey.get('idea_id'))

        updated = surveys_col().find_one({'_id': obj_id})
        return Response({'survey': serialize_doc(updated)})


class SurveyGenerateQuestionsAIView(APIView):
    """Uses Gemini to generate neutral, non-leading customer discovery questions."""
    permission_classes = [IsAuthenticatedMongo]

    def post(self, request):
        idea_title = request.data.get('title', 'Startup')
        problem = request.data.get('problem_statement', '')
        target = request.data.get('target_customers', '')

        prompt = f"""
        Act as a Lean Startup discovery expert (e.g. 'The Mom Test').
        Generate 5 neutral, non-leading survey questions to validate:
        Startup: {idea_title}
        Problem: {problem}
        Target Customer: {target}

        Supported types: 'single_choice', 'multiple_choice', 'rating_scale', 'short_answer', 'long_answer'.
        Output JSON strictly as an array of objects:
        [
          {{
            "id": "q1",
            "question_text": str,
            "question_type": "single_choice"|"multiple_choice"|"rating_scale"|"short_answer"|"long_answer",
            "is_required": true,
            "options": ["opt1", "opt2", ...],  // only if single_choice or multiple_choice
            "scale_min": 1, "scale_max": 5     // only if rating_scale
          }}
        ]
        """
        result = call_gemini_json(prompt, "Output strictly a JSON list of questions without leading bias.")
        if isinstance(result, list) and len(result) > 0:
            return Response({'questions': result, 'is_live_ai': True})
        if isinstance(result, dict) and 'questions' in result:
            return Response({'questions': result['questions'], 'is_live_ai': True})

        # Fallback neutral questions
        fallback_qs = [
            {
                "id": f"q_{uuid.uuid4().hex[:4]}",
                "question_text": f"How often do you personally encounter challenges related to {problem[:60] if problem else 'this workflow'}?",
                "question_type": "single_choice",
                "is_required": True,
                "options": ["Multiple times a week", "About once a week", "A few times a month", "Rarely or never"]
            },
            {
                "id": f"q_{uuid.uuid4().hex[:4]}",
                "question_text": "What is the single most frustrating part of your current approach?",
                "question_type": "long_answer",
                "is_required": True
            },
            {
                "id": f"q_{uuid.uuid4().hex[:4]}",
                "question_text": "How satisfied are you with the tools or workarounds you currently use? (1 = Very Dissatisfied, 5 = Highly Satisfied)",
                "question_type": "rating_scale",
                "is_required": True,
                "scale_min": 1,
                "scale_max": 5
            },
            {
                "id": f"q_{uuid.uuid4().hex[:4]}",
                "question_text": "Which factors are most important when deciding to try a new tool?",
                "question_type": "multiple_choice",
                "is_required": True,
                "options": ["Ease of use & quick setup", "Low or transparent pricing", "Data privacy & security", "Integrations with existing software", "Helpful customer support"]
            },
            {
                "id": f"q_{uuid.uuid4().hex[:4]}",
                "question_text": "What is the maximum you would expect to pay per month for a solution that completely solves this problem?",
                "question_type": "single_choice",
                "is_required": True,
                "options": ["$0 (Free tier only)", "$10 - $25 / month", "$25 - $50 / month", "$50 - $100 / month", "$100+ / month"]
            }
        ]
        return Response({'questions': fallback_qs, 'is_live_ai': False})


class PublicSurveyView(APIView):
    """Public read-only view of a survey for respondents."""
    permission_classes = [AllowAny]

    def get(self, request, token):
        survey = surveys_col().find_one({'token': token})
        if not survey:
            return Response({'error': 'Survey not found or invalid link'}, status=status.HTTP_404_NOT_FOUND)

        if survey.get('status') == 'closed':
            return Response({
                'error': 'This survey is currently closed to new responses.',
                'status': 'closed',
                'title': survey.get('title')
            }, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'survey': {
                'id': str(survey['_id']),
                'token': survey.get('token'),
                'title': survey.get('title'),
                'description': survey.get('description'),
                'questions': survey.get('questions', []),
                'status': survey.get('status')
            }
        })


class PublicSurveySubmitResponseView(APIView):
    """Public submission of survey responses with anti-spam check."""
    permission_classes = [AllowAny]

    def post(self, request, token):
        survey = surveys_col().find_one({'token': token})
        if not survey:
            return Response({'error': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)

        if survey.get('status') == 'closed':
            return Response({'error': 'This survey is closed.'}, status=status.HTTP_400_BAD_REQUEST)

        answers = request.data.get('answers', {})
        if not answers:
            return Response({'error': 'Please provide survey answers.'}, status=status.HTTP_400_BAD_REQUEST)

        # Anti-spam check: check IP submission rate in last 10 seconds
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        recent = survey_responses_col().count_documents({
            'survey_id': str(survey['_id']),
            'ip_address': ip,
            'submitted_at': {'$gte': datetime.utcnow() - timedelta(seconds=5)}
        })
        if recent > 2:
            return Response({'error': 'Too many submissions. Please wait a moment.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        response_doc = {
            'survey_id': str(survey['_id']),
            'token': token,
            'answers': answers,
            'ip_address': ip,
            'submitted_at': datetime.utcnow()
        }
        res = survey_responses_col().insert_one(response_doc)
        response_doc['_id'] = res.inserted_id

        return Response({
            'message': 'Thank you! Your feedback has been recorded.',
            'response_id': str(res.inserted_id)
        }, status=status.HTTP_201_CREATED)


class SurveyAnalyticsView(APIView):
    """Calculates actual survey analytics for charts: completion rate, distributions, pain points."""
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid survey ID'}, status=status.HTTP_400_BAD_REQUEST)

        survey = surveys_col().find_one({'_id': obj_id})
        if not survey:
            return Response({'error': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)

        idea, err = check_idea_access(request.user.id, survey.get('idea_id'))
        if err:
            return err

        responses = list(survey_responses_col().find({'survey_id': str(survey['_id'])}).sort('submitted_at', -1))
        total_resp = len(responses)

        # Calculate question-level distributions for Recharts
        questions = survey.get('questions', [])
        question_analytics = []

        ratings_all = []
        for q in questions:
            q_id = q.get('id')
            q_type = q.get('question_type')
            q_text = q.get('question_text')
            
            q_stats = {
                'id': q_id,
                'question_text': q_text,
                'question_type': q_type,
                'distribution': [],
                'text_responses': []
            }

            if q_type in ['single_choice', 'multiple_choice']:
                counts = {}
                for opt in q.get('options', []):
                    counts[opt] = 0
                for r in responses:
                    val = r.get('answers', {}).get(q_id)
                    if isinstance(val, list):
                        for item in val:
                            counts[str(item)] = counts.get(str(item), 0) + 1
                    elif val:
                        counts[str(val)] = counts.get(str(val), 0) + 1
                q_stats['distribution'] = [{'name': k, 'count': v} for k, v in counts.items()]

            elif q_type == 'rating_scale':
                scale_counts = {str(i): 0 for i in range(q.get('scale_min', 1), q.get('scale_max', 5) + 1)}
                for r in responses:
                    val = r.get('answers', {}).get(q_id)
                    if val is not None:
                        val_str = str(val)
                        scale_counts[val_str] = scale_counts.get(val_str, 0) + 1
                        try:
                            ratings_all.append(float(val))
                        except Exception:
                            pass
                q_stats['distribution'] = [{'rating': f"{k} Stars", 'count': v} for k, v in scale_counts.items()]

            elif q_type in ['short_answer', 'long_answer']:
                for r in responses:
                    val = r.get('answers', {}).get(q_id)
                    if val:
                        q_stats['text_responses'].append(str(val))

            question_analytics.append(q_stats)

        # Overall Metrics
        avg_rating = round(sum(ratings_all) / len(ratings_all), 1) if ratings_all else None
        completion_rate = 100.0 if total_resp > 0 else 0.0

        # Run AI customer validation agent summary if responses exist
        ai_summary = CustomerValidationAgent.analyze_responses(idea, [survey], responses)

        return Response({
            'survey_title': survey.get('title'),
            'total_responses': total_resp,
            'completion_rate': completion_rate,
            'average_rating': avg_rating,
            'question_analytics': question_analytics,
            'ai_insights': ai_summary.model_dump(),
            'responses': serialize_docs(responses)
        })


class SurveyExportCSVView(APIView):
    """Exports survey responses using Pandas to CSV."""
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid survey ID'}, status=status.HTTP_400_BAD_REQUEST)

        survey = surveys_col().find_one({'_id': obj_id})
        if not survey:
            return Response({'error': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)

        idea, err = check_idea_access(request.user.id, survey.get('idea_id'))
        if err:
            return err

        responses = list(survey_responses_col().find({'survey_id': str(survey['_id'])}).sort('submitted_at', -1))
        csv_data = export_survey_responses_to_csv(serialize_docs(responses), survey.get('questions', []))

        response = HttpResponse(csv_data, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="survey_{survey.get("token")}_responses.csv"'
        return response


# ==========================================
# 5. COMPETITOR ANALYSIS CRUD
# ==========================================
class CompetitorListCreateView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        competitors = list(competitors_col().find({'idea_id': str(idea['_id'])}).sort('created_at', -1))
        return Response({'competitors': serialize_docs(competitors)})

    def post(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        data = request.data
        name = data.get('name', '').strip()
        if not name:
            return Response({'error': 'Competitor name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        now = datetime.utcnow()
        doc = {
            'idea_id': str(idea['_id']),
            'name': name,
            'website': data.get('website', ''),
            'product_description': data.get('product_description', ''),
            'features': data.get('features', ''),
            'pricing': data.get('pricing', ''),
            'target_customers': data.get('target_customers', ''),
            'strengths': data.get('strengths', ''),
            'weaknesses': data.get('weaknesses', ''),
            'last_verified_date': data.get('last_verified_date') or now.strftime("%Y-%m-%d"),
            'source_references': data.get('source_references', 'Direct research'),
            'created_at': now,
            'updated_at': now
        }
        res = competitors_col().insert_one(doc)
        doc['_id'] = res.inserted_id

        log_activity(request.user.id, "Add Competitor", f"Added competitor '{name}'", str(idea['_id']))
        return Response({'competitor': serialize_doc(doc)}, status=status.HTTP_201_CREATED)


class CompetitorDetailView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def delete(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid competitor ID'}, status=status.HTTP_400_BAD_REQUEST)

        comp = competitors_col().find_one({'_id': obj_id})
        if not comp:
            return Response({'error': 'Competitor not found'}, status=status.HTTP_404_NOT_FOUND)

        idea, err = check_idea_access(request.user.id, comp.get('idea_id'))
        if err:
            return err

        competitors_col().delete_one({'_id': obj_id})
        log_activity(request.user.id, "Delete Competitor", f"Removed competitor '{comp.get('name')}'", comp.get('idea_id'))
        return Response({'message': 'Competitor removed successfully'})


# ==========================================
# 6. FINANCIAL SIMULATOR APIS
# ==========================================
class FinancialSimulationView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        fin = financial_assumptions_col().find_one({'idea_id': str(idea['_id'])})
        if not fin:
            return Response({'financials': None, 'simulation': None})

        sim_result = run_financial_simulation(serialize_doc(fin))
        ai_analysis = FinancialAnalysisAgent.analyze(sim_result, idea)

        return Response({
            'financials': serialize_doc(fin),
            'simulation': sim_result,
            'ai_analysis': ai_analysis.model_dump()
        })

    def post(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        inputs = request.data
        inputs['idea_id'] = str(idea['_id'])
        inputs['updated_at'] = datetime.utcnow()

        financial_assumptions_col().update_one(
            {'idea_id': str(idea['_id'])},
            {'$set': inputs},
            upsert=True
        )

        sim_result = run_financial_simulation(inputs)
        ai_analysis = FinancialAnalysisAgent.analyze(sim_result, idea)

        log_activity(request.user.id, "Financial Simulation", f"Ran financial simulator for '{idea.get('title')}'", str(idea['_id']))
        return Response({
            'financials': inputs,
            'simulation': sim_result,
            'ai_analysis': ai_analysis.model_dump()
        })


# ==========================================
# 7. RISK & ROADMAP MANAGEMENT
# ==========================================
class RiskListCreateView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        risks = list(risks_col().find({'idea_id': str(idea['_id'])}).sort('created_at', -1))
        return Response({'risks': serialize_docs(risks)})

    def post(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        data = request.data
        now = datetime.utcnow()
        doc = {
            'idea_id': str(idea['_id']),
            'category': data.get('category', 'Market demand'),
            'description': data.get('description', ''),
            'likelihood': data.get('likelihood', 'Medium'),
            'impact': data.get('impact', 'Medium'),
            'severity': data.get('severity', 'Medium'),
            'supporting_evidence': data.get('supporting_evidence', ''),
            'mitigation_plan': data.get('mitigation_plan', ''),
            'assigned_owner': data.get('assigned_owner', 'Founding Team'),
            'status': data.get('status', 'Active'),
            'created_at': now,
            'updated_at': now
        }
        res = risks_col().insert_one(doc)
        doc['_id'] = res.inserted_id

        log_activity(request.user.id, "Add Risk", f"Logged risk in {doc['category']}", str(idea['_id']))
        return Response({'risk': serialize_doc(doc)}, status=status.HTTP_201_CREATED)


class RiskDetailView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def patch(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid risk ID'}, status=status.HTTP_400_BAD_REQUEST)

        risk = risks_col().find_one({'_id': obj_id})
        if not risk:
            return Response({'error': 'Risk not found'}, status=status.HTTP_404_NOT_FOUND)

        idea, err = check_idea_access(request.user.id, risk.get('idea_id'))
        if err:
            return err

        updates = {k: v for k, v in request.data.items() if k in [
            'category', 'description', 'likelihood', 'impact', 'severity',
            'supporting_evidence', 'mitigation_plan', 'assigned_owner', 'status'
        ]}
        if updates:
            updates['updated_at'] = datetime.utcnow()
            risks_col().update_one({'_id': obj_id}, {'$set': updates})

        updated = risks_col().find_one({'_id': obj_id})
        return Response({'risk': serialize_doc(updated)})

    def delete(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid risk ID'}, status=status.HTTP_400_BAD_REQUEST)

        risk = risks_col().find_one({'_id': obj_id})
        if not risk:
            return Response({'error': 'Risk not found'}, status=status.HTTP_404_NOT_FOUND)

        idea, err = check_idea_access(request.user.id, risk.get('idea_id'))
        if err:
            return err

        risks_col().delete_one({'_id': obj_id})
        return Response({'message': 'Risk item deleted successfully'})


class RoadmapListCreateView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        tasks = list(roadmap_tasks_col().find({'idea_id': str(idea['_id'])}).sort('deadline_days', 1))
        return Response({'tasks': serialize_docs(tasks)})

    def post(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        data = request.data
        now = datetime.utcnow()
        doc = {
            'idea_id': str(idea['_id']),
            'timeframe': data.get('timeframe', 'Next 7 days'),
            'title': data.get('title', 'Actionable Task'),
            'description': data.get('description', ''),
            'priority': data.get('priority', 'Medium'),
            'deadline_days': int(data.get('deadline_days', 7)),
            'assigned_user': data.get('assigned_user', 'Founder'),
            'status': data.get('status', 'Pending'),
            'expected_outcome': data.get('expected_outcome', ''),
            'created_at': now,
            'updated_at': now
        }
        res = roadmap_tasks_col().insert_one(doc)
        doc['_id'] = res.inserted_id

        log_activity(request.user.id, "Add Task", f"Added roadmap task '{doc['title']}'", str(idea['_id']))
        return Response({'task': serialize_doc(doc)}, status=status.HTTP_201_CREATED)


class RoadmapDetailView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def patch(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid task ID'}, status=status.HTTP_400_BAD_REQUEST)

        task = roadmap_tasks_col().find_one({'_id': obj_id})
        if not task:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        idea, err = check_idea_access(request.user.id, task.get('idea_id'))
        if err:
            return err

        updates = {k: v for k, v in request.data.items() if k in [
            'timeframe', 'title', 'description', 'priority',
            'deadline_days', 'assigned_user', 'status', 'expected_outcome'
        ]}
        if updates:
            updates['updated_at'] = datetime.utcnow()
            roadmap_tasks_col().update_one({'_id': obj_id}, {'$set': updates})

        updated = roadmap_tasks_col().find_one({'_id': obj_id})
        return Response({'task': serialize_doc(updated)})

    def delete(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid task ID'}, status=status.HTTP_400_BAD_REQUEST)

        task = roadmap_tasks_col().find_one({'_id': obj_id})
        if not task:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        idea, err = check_idea_access(request.user.id, task.get('idea_id'))
        if err:
            return err

        roadmap_tasks_col().delete_one({'_id': obj_id})
        return Response({'message': 'Task removed'})


# ==========================================
# 8. REPORTS & PDF DOWNLOAD
# ==========================================
class ReportListCreateView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        idea, err_response = check_idea_access(request.user.id, id)
        if err_response:
            return err_response

        reports = list(reports_col().find({'idea_id': str(idea['_id'])}).sort('created_at', -1))
        return Response({'reports': serialize_docs(reports)})

    def post(self, request, id):
        # Trigger full report run
        view = FullValidationRunAIView.as_view()
        return view(request._request, id=id)


class ReportDetailDownloadView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request, id):
        obj_id = to_object_id(id)
        if not obj_id:
            return Response({'error': 'Invalid report ID'}, status=status.HTTP_400_BAD_REQUEST)

        report = reports_col().find_one({'_id': obj_id})
        if not report:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        idea, err = check_idea_access(request.user.id, report.get('idea_id'))
        if err:
            return err

        report_data = report.get('report_data', {})
        scoring = report_data.get('validation_score', {})
        coverage = scoring.get('evidence_coverage', {})

        # Generate ReportLab PDF
        pdf_bytes = generate_pdf_report(
            idea=idea,
            validation_report=report_data,
            scoring=scoring,
            evidence_coverage=coverage
        )

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        filename = f"IdeaProof_Report_{idea.get('title', 'Startup')[:20].replace(' ', '_')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


# ==========================================
# 9. DASHBOARD SUMMARY & ACTIVITY LOGS
# ==========================================
class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request):
        user_id = request.user.id
        ideas = list(startup_ideas_col().find({'user_id': user_id}))
        idea_ids = [str(i['_id']) for i in ideas]

        total_ideas = len(ideas)
        total_reports = reports_col().count_documents({'idea_id': {'$in': idea_ids}})
        total_surveys = surveys_col().count_documents({'idea_id': {'$in': idea_ids}})
        total_responses = survey_responses_col().count_documents({})

        # Ideas under validation
        under_val = sum(1 for i in ideas if i.get('development_stage') in ['Idea Phase', 'Validation & Prototype'])
        
        # Calculate average evidence coverage across ideas
        coverage_scores = []
        recent_scores = []
        for i_id in idea_ids:
            score = validation_scores_col().find_one({'idea_id': i_id}, sort=[('created_at', -1)])
            if score and 'score_data' in score:
                sd = score['score_data']
                coverage_scores.append(sd.get('evidence_coverage', {}).get('coverage_percentage', 0))
                recent_scores.append(sd.get('overall_score', 0))

        avg_coverage = round(sum(coverage_scores) / len(coverage_scores), 1) if coverage_scores else 0.0
        avg_score = round(sum(recent_scores) / len(recent_scores), 1) if recent_scores else None

        # Recent activities
        activities = list(activity_logs_col().find({'user_id': user_id}).sort('created_at', -1).limit(8))

        # Pending tasks
        pending_tasks = list(roadmap_tasks_col().find({'idea_id': {'$in': idea_ids}, 'status': {'$ne': 'Completed'}}).sort('deadline_days', 1).limit(5))

        return Response({
            'total_ideas': total_ideas,
            'ideas_under_validation': under_val,
            'completed_reports': total_reports,
            'total_surveys': total_surveys,
            'total_responses': total_responses,
            'average_evidence_coverage': avg_coverage,
            'average_validation_score': avg_score,
            'recent_activity': serialize_docs(activities),
            'pending_tasks': serialize_docs(pending_tasks)
        })


class ActivityLogListView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request):
        logs = list(activity_logs_col().find({'user_id': request.user.id}).sort('created_at', -1).limit(30))
        return Response({'activities': serialize_docs(logs)})


# ==========================================
# 10. TEAM WORKSPACE
# ==========================================
class TeamWorkspaceView(APIView):
    permission_classes = [IsAuthenticatedMongo]

    def get(self, request):
        user_id = request.user.id
        team = teams_col().find_one({'owner_id': user_id})
        if not team:
            # Create default personal workspace
            t_doc = {
                'name': f"{request.user.name or 'Founder'}'s Workspace",
                'owner_id': user_id,
                'created_at': datetime.utcnow()
            }
            res = teams_col().insert_one(t_doc)
            team = t_doc
            team['_id'] = res.inserted_id

        team_id = str(team['_id'])
        memberships = list(team_memberships_col().find({'team_id': team_id}))

        # Also find ideas shared
        shared_ideas = list(startup_ideas_col().find({'user_id': user_id}))

        return Response({
            'team': serialize_doc(team),
            'members': serialize_docs(memberships),
            'ideas': serialize_docs(shared_ideas)
        })

    def post(self, request):
        """Invite a team member by email."""
        user_id = request.user.id
        team = teams_col().find_one({'owner_id': user_id})
        if not team:
            return Response({'error': 'Workspace not found'}, status=status.HTTP_404_NOT_FOUND)

        invite_email = request.data.get('email', '').strip().lower()
        role = request.data.get('role', 'Collaborator')
        if not invite_email or '@' not in invite_email:
            return Response({'error': 'Valid email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        now = datetime.utcnow()
        doc = {
            'team_id': str(team['_id']),
            'email': invite_email,
            'role': role,
            'status': 'Active',
            'invited_at': now
        }
        team_memberships_col().insert_one(doc)
        log_activity(user_id, "Invite Member", f"Invited {invite_email} as {role}")

        return Response({'message': f"Invitation sent to {invite_email}", 'member': serialize_doc(doc)}, status=status.HTTP_201_CREATED)
