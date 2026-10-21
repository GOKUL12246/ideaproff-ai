import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ideaproof_project.settings')
django.setup()

import pytest
from rest_framework.test import APIClient
from bson import ObjectId

from api.db import (
    users_col,
    startup_ideas_col,
    surveys_col,
    survey_responses_col,
    competitors_col,
    financial_assumptions_col
)
from api.financial_simulator import run_financial_simulation
from api.scoring_engine import evaluate_idea, calculate_evidence_coverage
from api.ai_agents import AIOrchestrator, IdeaAnalysisAgent
from api.report_generator import generate_pdf_report, export_survey_responses_to_csv

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def registered_user():
    email = f"test_{ObjectId()}@example.com"
    client = APIClient()
    res = client.post('/api/auth/register', {
        'email': email,
        'password': 'password123',
        'name': 'Test Founder',
        'role': 'Startup Founder'
    }, format='json')
    assert res.status_code == 201
    return {
        'email': email,
        'token': res.data['tokens']['access_token'],
        'user': res.data['user']
    }

def test_user_registration_and_login(api_client):
    email = f"user_{ObjectId()}@example.com"
    # 1. Register
    reg_res = api_client.post('/api/auth/register', {
        'email': email,
        'password': 'strongpassword',
        'name': 'Alice Innovator',
        'role': 'Student'
    }, format='json')
    assert reg_res.status_code == 201
    assert 'tokens' in reg_res.data
    assert reg_res.data['user']['role'] == 'Student'

    # 2. Login
    login_res = api_client.post('/api/auth/login', {
        'email': email,
        'password': 'strongpassword'
    }, format='json')
    assert login_res.status_code == 200
    assert 'access_token' in login_res.data['tokens']

    # 3. /me with token
    token = login_res.data['tokens']['access_token']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    me_res = api_client.get('/api/auth/me')
    assert me_res.status_code == 200
    assert me_res.data['user']['email'] == email

def test_startup_idea_crud_and_demo_seed(api_client, registered_user):
    token = registered_user['token']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # Create Idea
    create_res = api_client.post('/api/ideas', {
        'title': 'SolarClean Drone',
        'industry': 'CleanTech',
        'problem_statement': 'Solar farm panels get covered in dust and lose 25% efficiency.',
        'proposed_solution': 'Autonomous cleaning drones equipped with electrostatic dust brushes.',
        'target_customers': 'Commercial solar farm operators',
        'target_geography': 'Southwestern United States',
        'unique_value_proposition': 'Zero-water solar panel cleaning that restores 98% efficiency in minutes.',
        'available_budget': '$15,000 grant',
        'development_stage': 'Idea Phase'
    }, format='json')
    assert create_res.status_code == 201
    idea_id = create_res.data['idea']['id']

    # Get Idea
    get_res = api_client.get(f'/api/ideas/{idea_id}')
    assert get_res.status_code == 200
    assert get_res.data['idea']['title'] == 'SolarClean Drone'

    # Patch Idea
    patch_res = api_client.patch(f'/api/ideas/{idea_id}', {
        'development_stage': 'Validation & Prototype'
    }, format='json')
    assert patch_res.status_code == 200
    assert patch_res.data['idea']['development_stage'] == 'Validation & Prototype'

    # Seed Demo Data
    seed_res = api_client.post('/api/ideas/demo/seed')
    assert seed_res.status_code == 201
    assert 'demo_data' in seed_res.data
    assert seed_res.data['demo_data']['responses_count'] == 10

def test_survey_lifecycle_and_public_submission(api_client, registered_user):
    token = registered_user['token']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # Create idea first
    idea_res = api_client.post('/api/ideas', {
        'title': 'EcoBottle',
        'industry': 'Consumer Goods',
        'problem_statement': 'Plastic waste in gyms and universities.'
    }, format='json')
    idea_id = idea_res.data['idea']['id']

    # Create Survey
    survey_res = api_client.post(f'/api/ideas/{idea_id}/surveys', {
        'title': 'EcoBottle Consumer Survey',
        'description': 'Gathering feedback on reusable smart bottles.'
    }, format='json')
    assert survey_res.status_code == 201
    survey = survey_res.data['survey']
    survey_id = survey['id']
    survey_token = survey['token']

    # Public View (Unauthenticated)
    unauth_client = APIClient()
    pub_res = unauth_client.get(f'/api/public/surveys/{survey_token}')
    assert pub_res.status_code == 200
    assert pub_res.data['survey']['token'] == survey_token

    # Public Response Submission
    resp_res = unauth_client.post(f'/api/public/surveys/{survey_token}/responses', {
        'answers': {
            'q1': 'Daily',
            'q2': 'Metal hydro flask',
            'q3': 4,
            'q4': 'Extremely interested',
            'q5': 'Price and weight'
        }
    }, format='json')
    assert resp_res.status_code == 201
    assert 'response_id' in resp_res.data

    # Analytics View (Authenticated)
    analytics_res = api_client.get(f'/api/surveys/{survey_id}/analytics')
    assert analytics_res.status_code == 200
    assert analytics_res.data['total_responses'] >= 1

    # CSV Export
    csv_res = api_client.get(f'/api/surveys/{survey_id}/export-csv')
    assert csv_res.status_code == 200
    assert 'text/csv' in csv_res['Content-Type']

def test_financial_simulation_calculations():
    inputs = {
        'initial_investment': 5000,
        'development_costs': 3000,
        'monthly_opex': 500,
        'product_price': 50,
        'expected_customers': 100,
        'variable_costs': 10,
        'marketing_expenses': 800,
        'staffing_costs': 1200,
        'monthly_growth': 10
    }
    result = run_financial_simulation(inputs)
    assert 'base' in result
    assert 'conservative' in result
    assert 'optimistic' in result

    base = result['base']
    assert base['unit_contribution'] == 40.0
    assert base['contribution_margin_percentage'] == 80.0
    # Fixed monthly costs = 500 + 800 + 1200 = 2500
    assert base['fixed_monthly_costs'] == 2500.0
    # Break even customers = 2500 / 40 = 62.5 -> 63 or 62
    assert base['break_even_customers'] in [62, 63]
    assert len(base['monthly_projections']) == 12

def test_validation_scoring_engine_and_weights():
    idea = {
        'title': 'Test Startup',
        'industry': 'SaaS',
        'problem_statement': 'Lengthy problem statement describing enterprise friction and high switching costs.',
        'proposed_solution': 'AI-driven automated orchestration platform that unifies legacy systems.',
        'target_customers': 'VP of Engineering at mid-sized software enterprises',
        'unique_value_proposition': 'Cuts cloud compute configuration time by 80% without manual scripts.',
        'target_geography': 'Global',
        'team_skills': '2 Senior Cloud Engineers'
    }
    surveys = [{'id': 's1'}]
    responses = [{'answers': {'q1': 'Daily', 'q2': 5}} for _ in range(8)]
    competitors = [{'name': f'Comp {i}'} for i in range(3)]
    financials = {
        'price': 100,
        'variable_costs': 10,
        'initial_investment': 10000,
        'break_even_customers': 50,
        'expected_customers': 80
    }
    market = {
        'tam_usd': 500000000,
        'sam_usd': 100000000,
        'som_usd': 10000000,
        'trends': ['Cloud modernization']
    }
    risks = [{'category': 'Technical feasibility', 'description': 'Cloud scaling'}]

    eval_result = evaluate_idea(
        idea=idea,
        surveys=surveys,
        responses=responses,
        competitors=competitors,
        financials=financials,
        market=market,
        risks=risks
    )

    assert 0 <= eval_result['overall_score'] <= 100
    assert sum(eval_result['scoring_weights'].values()) == 100
    assert eval_result['recommendation_band'] in [
        'Reconsider assumptions', 'More validation required', 'Improve and test', 'Consider the next validation stage'
    ]
    assert len(eval_result['supporting_evidence']) > 0

def test_pdf_report_generation():
    idea = {
        'title': 'Test Medical Diagnostic AI',
        'industry': 'HealthTech',
        'target_geography': 'North America',
        'development_stage': 'Prototype',
        'problem_statement': 'Delayed radiologist triage for emergency CT scans.',
        'proposed_solution': 'Real-time AI bounding box detector for intracranial hemorrhage.',
        'unique_value_proposition': 'Flags critical brain bleeds under 90 seconds directly on the scanner PACS.',
        'target_customers': 'Hospital Emergency Departments'
    }
    scoring = {
        'overall_score': 78.5,
        'recommendation_band': 'Improve and test',
        'criterion_scores': {
            'customer_problem_and_demand': 85.0,
            'market_opportunity': 75.0,
            'competitor_differentiation': 80.0,
            'technical_feasibility': 70.0,
            'financial_viability': 80.0,
            'evidence_quality': 75.0
        },
        'scoring_weights': {
            'customer_problem_and_demand': 25,
            'market_opportunity': 20,
            'competitor_differentiation': 15,
            'technical_feasibility': 15,
            'financial_viability': 15,
            'evidence_quality': 10
        },
        'supporting_evidence': ['Validated with 15 trauma radiologists.', 'Healthy unit margin.'],
        'missing_evidence': ['FDA 510(k) clearance pathway audit.']
    }
    coverage = {
        'coverage_percentage': 82.5,
        'confidence_level': 'High'
    }
    validation_report = {
        'executive_summary': 'Strong early clinical signals and clear hospital department buyer profile.',
        'market_analysis': {
            'tam_sam_som_analysis': {
                'estimated_tam_usd': 2400000000,
                'estimated_sam_usd': 600000000,
                'estimated_som_usd': 45000000
            }
        },
        'financial_simulation': {
            'base': {
                'upfront_investment': 50000,
                'fixed_monthly_costs': 8000,
                'unit_contribution': 1200,
                'contribution_margin_percentage': 85.0,
                'break_even_customers': 7,
                'estimated_break_even_month': 5,
                'year_total_revenue': 180000,
                'year_net_profit': 34000
            }
        },
        'roadmap_tasks': [
            {'timeframe': 'Next 7 days', 'title': 'Complete IRB filing', 'priority': 'High', 'assigned_user': 'Clinical Lead', 'expected_outcome': 'Protocol submission'}
        ]
    }

    pdf_bytes = generate_pdf_report(idea, validation_report, scoring, coverage)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b'%PDF')

def test_sharemarket_analysis_and_stability_alerts(api_client, registered_user):
    token = registered_user['token']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # Create idea
    idea_res = api_client.post('/api/ideas', {
        'title': 'DormDash QuickFood',
        'industry': 'FoodTech & Logistics',
        'problem_statement': 'College students study late and need under-$10 meals in under 15 minutes.'
    }, format='json')
    assert idea_res.status_code == 201
    idea_id = idea_res.data['idea']['id']

    # 1. Sharemarket Analysis
    sm_res = api_client.get(f'/api/ideas/{idea_id}/sharemarket-analysis')
    assert sm_res.status_code == 200
    assert 'sharemarket_analysis' in sm_res.data
    analysis = sm_res.data['sharemarket_analysis']
    assert 'public_comps' in analysis
    assert len(analysis['public_comps']) >= 1
    assert 'market_sentiment' in analysis

    # 2. Stability Notification Dispatch
    notif_res = api_client.post(f'/api/ideas/{idea_id}/notify-stability')
    assert notif_res.status_code == 200
    assert 'notification_result' in notif_res.data
    notif = notif_res.data['notification_result']
    assert notif['is_stable'] is True
    assert 'twilio_dispatches' in notif
    assert len(notif['twilio_dispatches']) >= 1
    assert '+916369067138' in notif['twilio_dispatches'][0]['recipient']
    assert 'gmail_digest' in notif

    # 3. Direct Gmail Dispatch Endpoint
    gmail_res = api_client.post(f'/api/ideas/{idea_id}/send-gmail', {
        'recipient_email': 'founder.test@gmail.com'
    }, format='json')
    assert gmail_res.status_code == 200
    assert 'email_result' in gmail_res.data
    email_res = gmail_res.data['email_result']
    assert email_res['recipient'] == 'founder.test@gmail.com'
    assert 'compose_url' in email_res
    assert 'mailto_url' in email_res
    assert 'Startup Stable for Launch' in email_res['subject']


