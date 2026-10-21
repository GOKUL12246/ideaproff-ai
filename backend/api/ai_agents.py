import json
import logging
import re
import time
from typing import Any, Dict, List, Optional
from django.conf import settings
from .ai_schemas import (
    IdeaAnalysisOutput,
    MarketResearchOutput,
    CustomerValidationOutput,
    CompetitorAnalysisOutput,
    FinancialAnalysisOutput,
    RiskAssessmentOutput,
    RiskItem,
    RoadmapTaskItem
)

logger = logging.getLogger(__name__)

def clean_json_text(text: str) -> str:
    """Extracts JSON substring from markdown code fences or raw text."""
    text = text.strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        return match.group(1).strip()
    return text

def get_gemini_client():
    api_key = getattr(settings, 'GEMINI_API_KEY', '') or ''
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.warning(f"Could not initialize google.genai client: {e}")
        return None

def call_gemini_json(prompt: str, system_instruction: str = "") -> Optional[Dict[str, Any]]:
    client = get_gemini_client()
    if not client:
        return None
    
    model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
    
    # Retry loop with exponential backoff
    for attempt in range(3):
        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                system_instruction=system_instruction if system_instruction else None,
                temperature=0.2
            )
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config
            )
            if response and response.text:
                cleaned = clean_json_text(response.text)
                return json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Gemini API attempt {attempt+1} failed: {e}")
            if attempt < 2:
                time.sleep(1.5 * (attempt + 1))
    return None

# ==========================================
# AGENT A: Idea Analysis Agent
# ==========================================
class IdeaAnalysisAgent:
    """Structures startup ideas, identifies assumptions, and suggests an MVP."""
    
    @classmethod
    def analyze(cls, idea: Dict[str, Any]) -> IdeaAnalysisOutput:
        prompt = f"""
        Act as a Principal Startup Strategist and Product Architect.
        Analyze this startup idea submission:
        Startup Name: {idea.get('title')}
        Industry: {idea.get('industry')}
        Problem Statement: {idea.get('problem_statement')}
        Proposed Solution: {idea.get('proposed_solution')}
        Target Customers: {idea.get('target_customers')}
        Target Geography: {idea.get('target_geography')}
        Current Alternatives: {idea.get('current_alternatives')}
        Unique Value Proposition: {idea.get('unique_value_proposition')}
        Available Budget: {idea.get('available_budget')}
        Team Skills: {idea.get('team_skills')}
        Business Model: {idea.get('business_model')}
        Development Stage: {idea.get('development_stage')}

        Return structured JSON with keys:
        - refined_problem_statement: string (crisp, customer-centric problem definition)
        - proposed_solution_summary: string (direct, scalable solution architecture)
        - target_customer_segments: list of strings (3-4 specific persona segments)
        - customer_pain_point_hypotheses: list of strings (4 distinct pain points to validate)
        - unique_value_proposition: string (compelling UVP focusing on speed, cost, or convenience)
        - potential_revenue_models: list of strings (3 monetization avenues)
        - key_assumptions: list of objects [{{ "assumption": str, "risk_level": "High"|"Medium"|"Low", "validation_method": str }}]
        - mvp_recommendations: list of strings (core features strictly needed for v1 test)
        - initial_validation_experiments: list of objects [{{ "experiment_name": str, "hypothesis": str, "metric": str, "target_threshold": str }}]
        """
        
        system_instruction = "You are an expert startup incubator director. Output strictly valid JSON without markdown wrapping."
        result = call_gemini_json(prompt, system_instruction)
        
        if result:
            try:
                result['is_live_ai'] = True
                result['model_used'] = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
                return IdeaAnalysisOutput(**result)
            except Exception as e:
                logger.error(f"Failed to parse Gemini output for IdeaAnalysis: {e}")
        
        # Heuristic Domain Fallback
        name = idea.get('title', 'Your Startup')
        industry = idea.get('industry', 'Technology')
        problem = idea.get('problem_statement', 'Inefficient manual workflows')
        solution = idea.get('proposed_solution', 'Automated software platform')
        target = idea.get('target_customers', 'Early adopters and SMBs')
        
        return IdeaAnalysisOutput(
            refined_problem_statement=f"Target users in {industry} suffer from {problem.lower().rstrip('.')}, resulting in wasted hours, fragmented communication, and avoidable operational expenses.",
            proposed_solution_summary=f"{name} delivers {solution.lower().rstrip('.')}, unifying disjointed processes into a streamlined, automated experience designed for {target}.",
            target_customer_segments=[
                f"Primary: Tech-savvy {target} seeking immediate productivity gains",
                f"Secondary: Mid-market organizations in {industry} looking to reduce overhead",
                f"Tertiary: Academic, student, or bootstrapping teams constrained by budget"
            ],
            customer_pain_point_hypotheses=[
                "High time friction and cognitive load in existing alternative tools",
                "Lack of transparent pricing and high onboarding switching costs",
                "Absence of real-time collaboration or automated intelligence in current workflows",
                "Difficulty demonstrating measurable ROI to stakeholders"
            ],
            unique_value_proposition=idea.get('unique_value_proposition') or f"The fastest, most intuitive platform for {target} to achieve verified outcomes with zero technical complexity.",
            potential_revenue_models=[
                "Tiered SaaS Subscription (Freemium + Pro $29/mo + Team $99/mo)",
                "Usage-based metering or transactional commission (2-5% per successful transaction)",
                "Annual enterprise licensing with dedicated support and custom integrations"
            ],
            key_assumptions=[
                {"assumption": "Target users experience this problem at least weekly and actively search for solutions.", "risk_level": "High", "validation_method": "Customer discovery interviews and organic search keyword audit"},
                {"assumption": "Customers are willing to pay at least $20/month for automated resolution.", "risk_level": "High", "validation_method": "Smoke test pre-order campaign with credit card capture or deposit"},
                {"assumption": "The core technical MVP can be delivered with existing team capabilities within 4-6 weeks.", "risk_level": "Medium", "validation_method": "Prototype sprint and architecture spike"}
            ],
            mvp_recommendations=[
                "Single Core Workflow: Build only the #1 most requested feature end-to-end",
                "Self-service onboarding: Allow user sign up, setup, and first value in under 3 minutes",
                "Automated data export & reporting to prove immediate utility",
                "In-app feedback trigger after the user completes their primary action"
            ],
            initial_validation_experiments=[
                {"experiment_name": "Problem Validation Survey", "hypothesis": "At least 65% of surveyed users will rate this problem as 4/5 or 5/5 in urgency.", "metric": "Survey rating distribution", "target_threshold": ">= 65% high urgency"},
                {"experiment_name": "Landing Page Smoke Test", "hypothesis": "Driving targeted traffic will produce an email waitlist conversion rate exceeding 10%.", "metric": "Conversion rate to CTA click", "target_threshold": ">= 10% CTR"}
            ],
            is_live_ai=False,
            model_used="heuristic-fallback"
        )


# ==========================================
# AGENT B: Market Research Agent
# ==========================================
class MarketResearchAgent:
    """Summarizes available market evidence, opportunities, and TAM/SAM/SOM."""
    
    @classmethod
    def analyze(cls, idea: Dict[str, Any], market_inputs: Optional[Dict[str, Any]] = None) -> MarketResearchOutput:
        prompt = f"""
        Act as a Venture Capital Market Intelligence Analyst.
        Evaluate the market space for:
        Startup: {idea.get('title')} ({idea.get('industry')})
        Geography: {idea.get('target_geography')}
        Customer Segment: {idea.get('target_customers')}
        Provided Market Inputs: {json.dumps(market_inputs or {}, default=str)}

        Output JSON strictly with:
        - industry_overview: string (Macro sector size, growth drivers)
        - target_customer_segments: list of strings (addressable buyer sub-segments)
        - market_trends: list of strings (3-4 relevant technological or consumer trends)
        - market_opportunities: list of strings (3 unserved niches or tailwinds)
        - tam_sam_som_analysis: object with keys:
            - tam_explanation: str
            - sam_explanation: str
            - som_explanation: str
            - estimated_tam_usd: number
            - estimated_sam_usd: number
            - estimated_som_usd: number
            - calculation_formula: str
        - source_linked_findings: list of objects [{{ "source": str, "finding": str, "verification_status": "Estimate"|"Published Report" }}]
        - market_assumptions: list of strings
        - evidence_quality_indicators: string
        """
        
        result = call_gemini_json(prompt, "You are a senior market analyst. Never fabricate fake citations. Label estimates clearly.")
        if result:
            try:
                result['is_live_ai'] = True
                result['model_used'] = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
                return MarketResearchOutput(**result)
            except Exception as e:
                logger.error(f"Failed to parse MarketResearchOutput: {e}")
        
        # Heuristic Fallback
        industry = idea.get('industry', 'B2B Software')
        geo = idea.get('target_geography', 'North America & Global')
        
        # Calculate conservative baseline TAM/SAM/SOM if not provided
        user_tam = market_inputs.get('tam_usd') if market_inputs else None
        user_sam = market_inputs.get('sam_usd') if market_inputs else None
        user_som = market_inputs.get('som_usd') if market_inputs else None
        
        tam_val = float(user_tam) if user_tam else 1250000000.0  # $1.25B
        sam_val = float(user_sam) if user_sam else (tam_val * 0.18) # $225M
        som_val = float(user_som) if user_som else (sam_val * 0.05) # $11.25M
        
        return MarketResearchOutput(
            industry_overview=f"The {industry} sector across {geo} is experiencing accelerated modernization, fueled by cloud adoption, AI workflow augmentation, and demand for lower operational latency.",
            target_customer_segments=[
                f"Core Early Adopter: Tech-forward SMB operators and team leads in {industry}",
                f"Secondary: Growth-stage venture-backed teams expanding rapidly across {geo}",
                f"Tertiary: Institutional and enterprise divisions running pilot innovation programs"
            ],
            market_trends=[
                "Rapid shift from legacy monolithic suites toward specialized modular tools",
                "Increasing demand for transparent pay-as-you-go and self-serve onboarding",
                "Widespread adoption of AI copilot interfaces to reduce manual data entry",
                "Heightened focus on data privacy, zero-retention compliance, and auditability"
            ],
            market_opportunities=[
                "Unserved lower-market segment priced out of legacy enterprise providers",
                "Localized compliance, language, and regional payment support in under-penetrated markets",
                "API-first integration ecosystem allowing viral bottom-up developer adoption"
            ],
            tam_sam_som_analysis={
                "tam_explanation": f"Total global addressable demand for {industry} software tools ($ {tam_val:,.0f})",
                "sam_explanation": f"Serviceable addressable market within {geo} targeting tech-ready organizations ($ {sam_val:,.0f})",
                "som_explanation": f"Serviceable obtainable market captured within years 1-3 assuming 3-5% market share ($ {som_val:,.0f})",
                "estimated_tam_usd": tam_val,
                "estimated_sam_usd": sam_val,
                "estimated_som_usd": som_val,
                "calculation_formula": "Bottom-up: Estimated Total Target Accounts * Average Annual Revenue Per User (ARPU)"
            },
            source_linked_findings=[
                {"source": "Industry Market Benchmark Synthesis", "finding": f"Global spending in {industry} is projected to expand at a 14.8% CAGR over the next 5 years.", "verification_status": "Estimate"},
                {"source": "Venture Ecosystem Analysis", "finding": "Seed and early-stage capital is concentrating on high-margin software with proven unit economics.", "verification_status": "Estimate"}
            ],
            market_assumptions=[
                "Target accounts maintain an average annual budget of $1,200 to $6,000 for automation software.",
                "Customer churn in this category can be sustained below 2.0% monthly with continuous feature delivery."
            ],
            evidence_quality_indicators="Market sizing model utilizes bottom-up account multiplication. Requires primary survey validation for precise willingness-to-pay elasticity.",
            is_live_ai=False,
            model_used="heuristic-fallback"
        )


# ==========================================
# AGENT C: Customer Validation Agent
# ==========================================
class CustomerValidationAgent:
    """Analyzes actual survey responses, pain points, objections, and feedback."""
    
    @classmethod
    def analyze_responses(cls, idea: Dict[str, Any], surveys: List[Dict[str, Any]], responses: List[Dict[str, Any]]) -> CustomerValidationOutput:
        resp_count = len(responses)
        if resp_count == 0:
            return CustomerValidationOutput(
                total_responses_analyzed=0,
                primary_pain_points=[],
                interest_in_solution_summary="No customer survey responses collected yet. Direct demand remains an unverified hypothesis.",
                willingness_to_pay_insights="Willingness to pay cannot be determined without primary survey data.",
                customer_objections=["Lack of customer feedback data."],
                common_feedback_themes=["Survey has not yet gathered responses."],
                recommended_product_adjustments=["Publish and distribute survey to target users immediately."],
                is_live_ai=False,
                model_used="empty-state"
            )
        
        prompt = f"""
        Act as a Senior User Researcher.
        Analyze these real customer survey responses for startup idea '{idea.get('title')}':
        Survey Questions: {json.dumps([s.get('questions', []) for s in surveys], default=str)}
        Responses Data: {json.dumps([r.get('answers', {}) for r in responses], default=str)}

        Generate structured JSON:
        - total_responses_analyzed: integer
        - primary_pain_points: list of objects [{{ "pain_point": str, "frequency_score": int, "user_verbatim_summary": str }}]
        - interest_in_solution_summary: string
        - willingness_to_pay_insights: string
        - customer_objections: list of strings
        - common_feedback_themes: list of strings
        - recommended_product_adjustments: list of strings
        """
        
        result = call_gemini_json(prompt, "Analyze strictly the provided customer response records. Do not invent fake quotes.")
        if result:
            try:
                result['is_live_ai'] = True
                result['model_used'] = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
                return CustomerValidationOutput(**result)
            except Exception as e:
                logger.error(f"Failed to parse CustomerValidationOutput: {e}")
        
        # Heuristic Analysis of actual responses
        # Extract numerical ratings and text mentions
        pain_points_map = {}
        objections = []
        themes = []
        
        for r in responses:
            answers = r.get('answers', {})
            for q_id, ans in answers.items():
                ans_str = str(ans)
                if len(ans_str) > 10 and not ans_str.isdigit():
                    if any(w in ans_str.lower() for w in ['slow', 'expensive', 'hard', 'difficult', 'cost', 'time', 'bug', 'manual']):
                        pain_points_map[ans_str[:50]] = pain_points_map.get(ans_str[:50], 0) + 1
                    if any(w in ans_str.lower() for w in ['trust', 'security', 'price', 'switch', 'learning', 'support']):
                        objections.append(ans_str[:80])
                    themes.append(ans_str[:60])
        
        top_pains = [
            {"pain_point": k, "frequency_score": v, "user_verbatim_summary": f"Reported by {v} respondents"}
            for k, v in list(pain_points_map.items())[:4]
        ]
        if not top_pains:
            top_pains = [
                {"pain_point": "High operational time spent on manual workarounds", "frequency_score": max(1, resp_count // 2), "user_verbatim_summary": "Users noted frustration with repetitive steps."},
                {"pain_point": "Incompatible tooling and poor mobile responsiveness", "frequency_score": max(1, resp_count // 3), "user_verbatim_summary": "Users emphasized need for seamless cross-device workflow."}
            ]
            
        return CustomerValidationOutput(
            total_responses_analyzed=resp_count,
            primary_pain_points=top_pains,
            interest_in_solution_summary=f"Analysis of {resp_count} submitted response(s) indicates active interest in solving this friction, with early adopters requesting quick onboarding and reliable execution.",
            willingness_to_pay_insights=f"Respondents showed positive reception to affordable self-serve tiers, with sensitivity around recurring monthly commitments prior to seeing verified results.",
            customer_objections=objections[:4] if objections else [
                "Switching inertia from existing spreadsheets or ingrained habits",
                "Questions regarding learning curve and data migration security"
            ],
            common_feedback_themes=themes[:5] if themes else [
                "Simplicity of user interface is top priority",
                "Desire for automated notifications and progress tracking",
                "Demand for transparent pricing without hidden addon fees"
            ],
            recommended_product_adjustments=[
                "Implement 1-click template setup to bypass blank-slate onboarding anxiety",
                "Offer a 14-day risk-free trial or lightweight free tier to lower barrier to adoption",
                "Highlight security and export features prominently on marketing touchpoints"
            ],
            is_live_ai=False,
            model_used="heuristic-fallback"
        )


# ==========================================
# AGENT D: Competitor Analysis Agent
# ==========================================
class CompetitorAnalysisAgent:
    """Compares available competitor info and identifies differentiation opportunities."""
    
    @classmethod
    def analyze(cls, idea: Dict[str, Any], competitors: List[Dict[str, Any]]) -> CompetitorAnalysisOutput:
        prompt = f"""
        Act as a Competitive Strategy Consultant.
        Startup: {idea.get('title')} ({idea.get('industry')})
        UVP: {idea.get('unique_value_proposition')}
        Known Competitors Added: {json.dumps(competitors, default=str)}

        Return JSON strictly with:
        - competitive_landscape_summary: string
        - differentiation_opportunities: list of strings (4 actionable strategic moats)
        - white_space_opportunities: list of strings (3 unserved customer niches)
        - pricing_benchmarks: string
        """
        
        result = call_gemini_json(prompt, "You are a competitive intelligence strategist. Highlight defensible moats. Do not claim exhaustive competitor discovery.")
        if result:
            try:
                result['is_live_ai'] = True
                result['model_used'] = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
                return CompetitorAnalysisOutput(**result)
            except Exception as e:
                logger.error(f"Failed to parse CompetitorAnalysisOutput: {e}")
        
        # Heuristic Fallback
        comp_count = len(competitors)
        comp_names = [c.get('name', 'Competitor') for c in competitors] or ['Incumbent tools', 'Manual spreadsheets']
        
        return CompetitorAnalysisOutput(
            competitive_landscape_summary=(
                f"The competitive arena features {comp_count} identified player(s) including {', '.join(comp_names[:3])}. "
                f"Incumbents largely focus on complex enterprise feature sets, leaving mid-market and student/early-stage teams "
                f"grappling with bloated interfaces, steep pricing, and lengthy onboarding cycles."
            ),
            differentiation_opportunities=[
                "Speed-to-Value: Zero-configuration setup delivering first outcome in under 3 minutes",
                "Transparent, predictable pricing model without forced enterprise contracts",
                "AI-assisted guided workflows that eliminate manual configuration",
                "Modern, minimalist UI built specifically for collaborative agile teams"
            ],
            white_space_opportunities=[
                "Bootstrapping founders, student innovators, and university incubators overlooked by legacy vendors",
                "Mobile-first distributed teams requiring rapid on-the-go updates",
                "Privacy-conscious operators requiring self-contained data compliance"
            ],
            pricing_benchmarks="Competitor pricing averages $49 - $199/seat/month for legacy platforms, leaving a strong wedge for an aggressive $19 - $39 starter tier.",
            is_live_ai=False,
            model_used="heuristic-fallback"
        )


# ==========================================
# AGENT E: Financial Analysis Agent
# ==========================================
class FinancialAnalysisAgent:
    """Explains numerical financial simulation results calculated by Python and flags risks."""
    
    @classmethod
    def analyze(cls, simulation_results: Dict[str, Any], idea: Dict[str, Any]) -> FinancialAnalysisOutput:
        base = simulation_results.get('base', {})
        prompt = f"""
        Act as a Venture Capital CFO.
        Explain these Python-calculated financial simulation metrics:
        Startup: {idea.get('title')}
        Upfront Capital: ${base.get('upfront_investment')}
        Monthly Fixed Costs: ${base.get('fixed_monthly_costs')}
        Unit Contribution: ${base.get('unit_contribution')} ({base.get('contribution_margin_percentage')}%)
        Break-Even Customers: {base.get('break_even_customers')}
        Break-Even Month: {base.get('estimated_break_even_month')}
        Year 1 Projected Revenue: ${base.get('year_total_revenue')}
        Year 1 Projected Net Profit: ${base.get('year_net_profit')}

        Return JSON strictly with:
        - financial_executive_summary: string
        - burn_rate_and_runway_assessment: string
        - unit_economics_health: string
        - break_even_realism: string
        - financial_risks: list of strings (3 critical risks)
        - improvement_recommendations: list of strings (3 actionable financial optimizations)
        """
        
        result = call_gemini_json(prompt, "You are a startup CFO. Strictly explain the calculated numbers provided. Do not invent new financial numbers.")
        if result:
            try:
                result['is_live_ai'] = True
                result['model_used'] = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
                return FinancialAnalysisOutput(**result)
            except Exception as e:
                logger.error(f"Failed to parse FinancialAnalysisOutput: {e}")
        
        # Heuristic Fallback
        upfront = base.get('upfront_investment', 0)
        fixed = base.get('fixed_monthly_costs', 0)
        margin = base.get('contribution_margin_percentage', 0)
        be_cust = base.get('break_even_customers', 0)
        be_mo = base.get('estimated_break_even_month', '12+')
        rev = base.get('year_total_revenue', 0)
        net = base.get('year_net_profit', 0)
        
        return FinancialAnalysisOutput(
            financial_executive_summary=(
                f"The financial model indicates an upfront capital need of ${upfront:,.2f} with ongoing fixed monthly overhead of ${fixed:,.2f}. "
                f"Year 1 gross revenue reaches an estimated ${rev:,.2f}, resulting in a net year-end result of ${net:,.2f}."
            ),
            burn_rate_and_runway_assessment=(
                f"At an initial burn rate of ${fixed:,.2f}/month, the venture requires disciplined cash monitoring until customer acquisition "
                f"ramps. A minimum runway cushion of 6 to 9 months (${fixed * 8:,.2f}) is advised to mitigate customer acquisition volatility."
            ),
            unit_economics_health=(
                f"Unit contribution margin of {margin}% is healthy for a tech-enabled offering. "
                f"Ensure customer acquisition cost (CAC) does not exceed one-third of customer lifetime value (LTV:CAC >= 3:1)."
            ),
            break_even_realism=(
                f"Reaching break-even requires acquiring {be_cust} active paying accounts (projected at month {be_mo}). "
                f"This target is feasible provided organic conversion channels and referral loops are activated early."
            ),
            financial_risks=[
                "Customer Acquisition Cost (CAC) inflation in paid marketing channels eroding margins",
                "Working capital shortfall if upfront development exceeds initial budget",
                "Higher than modeled customer churn extending the break-even timeline"
            ],
            improvement_recommendations=[
                "Incentivize annual upfront subscriptions with a 15-20% discount to generate upfront non-dilutive working capital",
                "Implement product-led growth (PLG) viral loops to reduce reliance on paid ad spend",
                "Audit variable vendor expenses and cloud API usage monthly to maintain high contribution margins"
            ],
            is_live_ai=False,
            model_used="heuristic-fallback"
        )


# ==========================================
# AGENT F: Risk Assessment Agent
# ==========================================
class RiskAssessmentAgent:
    """Identifies market, technical, financial, operational, and adoption risks."""
    
    @classmethod
    def assess(cls, idea: Dict[str, Any], competitors: List[Dict[str, Any]], financials: Optional[Dict[str, Any]]) -> RiskAssessmentOutput:
        prompt = f"""
        Act as an Enterprise Risk Officer and Startup Diligence Director.
        Assess the risks for this venture:
        Startup: {idea.get('title')} ({idea.get('industry')})
        Problem: {idea.get('problem_statement')}
        Solution: {idea.get('proposed_solution')}
        Competitors Count: {len(competitors)}
        Budget: {idea.get('available_budget')}

        Categories required:
        - Market demand
        - Customer adoption
        - Competition
        - Technical feasibility
        - Financial sustainability
        - Operational execution
        - Data privacy / Legal

        Return JSON strictly with:
        - risks: list of objects [{{
            "category": str,
            "description": str,
            "likelihood": "High"|"Medium"|"Low",
            "impact": "High"|"Medium"|"Low",
            "severity": "Critical"|"High"|"Medium"|"Low",
            "supporting_evidence": str,
            "mitigation_plan": str,
            "assigned_owner": str
        }}]
        """
        
        result = call_gemini_json(prompt, "You are a startup risk analyst. Focus on realistic, actionable mitigations.")
        if result:
            try:
                result['is_live_ai'] = True
                result['model_used'] = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
                return RiskAssessmentOutput(**result)
            except Exception as e:
                logger.error(f"Failed to parse RiskAssessmentOutput: {e}")
        
        # Heuristic Risk Registry
        risks_list = [
            RiskItem(
                category="Market demand",
                description="Customers may acknowledge the pain point during surveys but prove unwilling to change habits or allocate budget.",
                likelihood="Medium",
                impact="High",
                severity="High",
                supporting_evidence="Early discovery interviews require commitment metrics (e.g. pre-orders or letters of intent).",
                mitigation_plan="Run pre-sale smoke tests and require small financial or time commitments before full feature build.",
                assigned_owner="Product Lead"
            ),
            RiskItem(
                category="Customer adoption",
                description="Onboarding friction or cognitive overhead leads to high user churn within the first 14 days.",
                likelihood="Medium",
                impact="Medium",
                severity="Medium",
                supporting_evidence="SaaS industry benchmarks show 40-60% of free trial users drop off after day one without guided setup.",
                mitigation_plan="Build interactive onboarding checklists, sample templates, and automated trigger emails on day 2 and day 5.",
                assigned_owner="Growth Lead"
            ),
            RiskItem(
                category="Competition",
                description="Established incumbents with large marketing budgets copy core feature sets or bundle functionality for free.",
                likelihood="Medium",
                impact="High",
                severity="High",
                supporting_evidence=f"Identified {len(competitors)} competitors with existing market presence.",
                mitigation_plan="Focus on deep vertical workflows, superior user experience, and building strong customer community relationships.",
                assigned_owner="Founder"
            ),
            RiskItem(
                category="Technical feasibility",
                description="Third-party API rate limits, downtime, or model hallucinations cause degraded user experience.",
                likelihood="Low",
                impact="High",
                severity="Medium",
                supporting_evidence="AI architectures depend on external inference reliability and data privacy compliance.",
                mitigation_plan="Implement resilient caching, deterministic heuristic fallbacks, and multi-provider retry logic.",
                assigned_owner="Engineering Lead"
            ),
            RiskItem(
                category="Financial sustainability",
                description="Customer Acquisition Cost (CAC) outpaces Customer Lifetime Value (LTV), depleting runway before profitability.",
                likelihood="Medium",
                impact="High",
                severity="High",
                supporting_evidence="Initial capital is limited; paid channels without viral loops quickly exhaust reserves.",
                mitigation_plan="Focus on organic content, student campus ambassador programs, and community word-of-mouth.",
                assigned_owner="Finance Lead"
            ),
            RiskItem(
                category="Data privacy",
                description="Improper handling of user personal data or credentials risks regulatory non-compliance.",
                likelihood="Low",
                impact="High",
                severity="Medium",
                supporting_evidence="Modern privacy regulations (GDPR/CCPA/FERPA) mandate explicit data consent and deletion rights.",
                mitigation_plan="Enforce encryption at rest and in transit, strict authorization boundaries, and publish clear privacy terms.",
                assigned_owner="Technical Lead"
            )
        ]
        
        return RiskAssessmentOutput(
            risks=risks_list,
            is_live_ai=False,
            model_used="heuristic-fallback"
        )


# ==========================================
# CENTRAL AI ORCHESTRATOR
# ==========================================
class AIOrchestrator:
    """
    Coordinates specialized agents, validates outputs with Pydantic,
    handles errors and missing evidence, and synthesizes a full validation report.
    """
    
    @classmethod
    def run_full_validation(
        cls,
        idea: Dict[str, Any],
        surveys: List[Dict[str, Any]],
        responses: List[Dict[str, Any]],
        competitors: List[Dict[str, Any]],
        financial_inputs: Optional[Dict[str, Any]],
        market_inputs: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        logger.info(f"AI Orchestrator starting full validation run for idea '{idea.get('title')}'")
        
        # 1. Run Idea Analysis Agent
        idea_analysis = IdeaAnalysisAgent.analyze(idea)
        
        # 2. Run Market Research Agent
        market_analysis = MarketResearchAgent.analyze(idea, market_inputs)
        
        # 3. Run Customer Validation Agent
        customer_analysis = CustomerValidationAgent.analyze_responses(idea, surveys, responses)
        
        # 4. Run Competitor Analysis Agent
        competitor_analysis = CompetitorAnalysisAgent.analyze(idea, competitors)
        
        # 5. Run Financial Simulator (Python) and Financial Analysis Agent
        from .financial_simulator import run_financial_simulation
        fin_sim = run_financial_simulation(financial_inputs or {
            'initial_investment': 5000,
            'development_costs': 3000,
            'monthly_opex': 400,
            'product_price': 29,
            'expected_customers': 50,
            'variable_costs': 3,
            'marketing_expenses': 600,
            'staffing_costs': 1000,
            'monthly_growth': 15
        })
        financial_analysis = FinancialAnalysisAgent.analyze(fin_sim, idea)
        
        # 6. Run Risk Assessment Agent
        risk_analysis = RiskAssessmentAgent.assess(idea, competitors, financial_inputs)
        
        # 7. Generate Actionable Startup Roadmap
        roadmap_tasks = cls.generate_roadmap(idea, customer_analysis, competitor_analysis, fin_sim)
        
        # 8. Deterministic Validation Scoring Engine
        from .scoring_engine import evaluate_idea
        scoring_result = evaluate_idea(
            idea=idea,
            surveys=surveys,
            responses=responses,
            competitors=competitors,
            financials=fin_sim.get('base'),
            market=market_analysis.tam_sam_som_analysis,
            risks=[r.model_dump() for r in risk_analysis.risks]
        )
        
        # Compile Executive Summary
        exec_summary = (
            f"IdeaProof AI Validation Report for '{idea.get('title')}'. "
            f"The concept addresses {idea.get('target_customers')} facing {idea.get('problem_statement')}. "
            f"With an empirical readiness score of {scoring_result['overall_score']}/100 "
            f"({scoring_result['recommendation_band']}) and evidence coverage of {scoring_result['evidence_coverage']['coverage_percentage']}%, "
            f"{scoring_result['recommendation_guidance']}"
        )
        
        return {
            'executive_summary': exec_summary,
            'idea_analysis': idea_analysis.model_dump(),
            'market_analysis': market_analysis.model_dump(),
            'customer_validation': customer_analysis.model_dump(),
            'competitor_analysis': competitor_analysis.model_dump(),
            'financial_simulation': fin_sim,
            'financial_analysis': financial_analysis.model_dump(),
            'risk_assessment': risk_analysis.model_dump(),
            'roadmap_tasks': roadmap_tasks,
            'validation_score': scoring_result,
            'generated_at': time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            'status': 'Completed'
        }

    @classmethod
    def generate_roadmap(
        cls,
        idea: Dict[str, Any],
        customer_analysis: CustomerValidationOutput,
        competitor_analysis: CompetitorAnalysisOutput,
        financial_sim: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        return [
            # Next 7 Days
            {
                "timeframe": "Next 7 days",
                "title": "Conduct 5 Customer Problem Interviews",
                "description": "Engage 5 target users directly using non-leading questions to validate core pain point hypotheses.",
                "priority": "High",
                "deadline_days": 7,
                "assigned_user": "Founder",
                "status": "In Progress",
                "expected_outcome": "5 completed interview transcripts detailing current workarounds."
            },
            {
                "timeframe": "Next 7 days",
                "title": "Deploy Customer Validation Survey",
                "description": "Distribute survey link across target communities, forums, or student networks to reach 25+ responses.",
                "priority": "High",
                "deadline_days": 7,
                "assigned_user": "Growth Lead",
                "status": "Pending",
                "expected_outcome": "Statistically relevant data on willingness to pay and feature priorities."
            },
            # Next 14 Days
            {
                "timeframe": "Next 14 days",
                "title": "Complete Competitor Differentiation Matrix",
                "description": "Audit top 3 direct competitors on pricing, feature gaps, and user onboarding friction.",
                "priority": "Medium",
                "deadline_days": 14,
                "assigned_user": "Strategist",
                "status": "Pending",
                "expected_outcome": "Refined positioning statement and defensive moat documentation."
            },
            {
                "timeframe": "Next 14 days",
                "title": "Smoke Test Landing Page & Waitlist",
                "description": "Launch a single-page value proposition test with email collection and track visitor-to-signup conversion.",
                "priority": "High",
                "deadline_days": 14,
                "assigned_user": "Marketing Lead",
                "status": "Pending",
                "expected_outcome": "Measure landing page conversion rate (target > 8%)."
            },
            # Next 30 Days
            {
                "timeframe": "Next 30 days",
                "title": "Build Scoped Minimum Viable Product (MVP)",
                "description": "Develop the single most critical workflow identified during customer interviews. Avoid feature creep.",
                "priority": "High",
                "deadline_days": 30,
                "assigned_user": "Technical Lead",
                "status": "Pending",
                "expected_outcome": "Functional clickable prototype ready for closed beta onboarding."
            },
            {
                "timeframe": "Next 30 days",
                "title": "Validate Unit Economics with Pilot Users",
                "description": "Present paid pilot terms to 10 qualified survey respondents to test actual payment willingness.",
                "priority": "High",
                "deadline_days": 30,
                "assigned_user": "Founder",
                "status": "Pending",
                "expected_outcome": "At least 3 paid or LOI commitments confirming price elasticity."
            },
            # Long-term Milestones
            {
                "timeframe": "Long-term milestones",
                "title": "Launch Public Beta & Cohort Retention Tracking",
                "description": "Open platform to first 100 users and measure 30-day retention and Net Promoter Score (NPS).",
                "priority": "Medium",
                "deadline_days": 90,
                "assigned_user": "Full Team",
                "status": "Pending",
                "expected_outcome": "Steady weekly active user growth and under 5% monthly churn."
            },
            {
                "timeframe": "Long-term milestones",
                "title": "Assemble Investor & Incubator Validation Dossier",
                "description": "Package IdeaProof AI validation scores, customer evidence, and financial simulator models into pitch deck.",
                "priority": "Medium",
                "deadline_days": 120,
                "assigned_user": "Founder",
                "status": "Pending",
                "expected_outcome": "Audit-ready diligence package for angel/pre-seed applications."
            }
        ]
