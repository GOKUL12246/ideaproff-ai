from typing import Any, Dict, List, Optional, Tuple

WEIGHTS = {
    'customer_problem_and_demand': 0.25,
    'market_opportunity': 0.20,
    'competitor_differentiation': 0.15,
    'technical_feasibility': 0.15,
    'financial_viability': 0.15,
    'evidence_quality': 0.10,
}

RECOMMENDATION_BANDS = [
    {
        'range': (0, 39),
        'band': 'Reconsider assumptions',
        'guidance': 'Critical core assumptions remain unverified or evidence indicates weak demand/differentiation. Re-interview target users and re-examine problem urgency before building.'
    },
    {
        'range': (40, 59),
        'band': 'More validation required',
        'guidance': 'Initial foundation exists, but major gaps remain in customer evidence or financial viability. Collect direct survey feedback and benchmark key competitors.'
    },
    {
        'range': (60, 79),
        'band': 'Improve and test',
        'guidance': 'Solid initial indicators. Run a focused Minimum Viable Product (MVP) pilot or landing-page smoke test to measure true willingness to pay and conversion.'
    },
    {
        'range': (80, 100),
        'band': 'Consider the next validation stage',
        'guidance': 'Strong evidence across customer demand, market sizing, and financial feasibility. Proceed to building an MVP prototype and launch controlled customer onboarding.'
    }
]

def calculate_evidence_coverage(
    idea: Dict[str, Any],
    surveys: List[Dict[str, Any]],
    responses: List[Dict[str, Any]],
    competitors: List[Dict[str, Any]],
    financials: Optional[Dict[str, Any]],
    market: Optional[Dict[str, Any]],
    risks: List[Dict[str, Any]]
) -> Dict[str, Any]:
    checks = []
    
    # 1. Customer survey responses
    resp_count = len(responses)
    has_customer_evidence = resp_count >= 3
    checks.append({
        'pillar': 'Customer Demand Evidence',
        'status': 'verified' if resp_count >= 5 else ('partial' if resp_count > 0 else 'missing'),
        'details': f'{resp_count} survey responses collected' if resp_count > 0 else 'No customer survey responses collected yet',
        'score': 100 if resp_count >= 10 else (60 if resp_count >= 3 else (20 if resp_count > 0 else 0))
    })

    # 2. Market Sizing Evidence
    has_tam = bool(market and market.get('tam_usd'))
    checks.append({
        'pillar': 'Market Sizing Evidence',
        'status': 'verified' if has_tam else 'missing',
        'details': f'TAM ${market.get("tam_usd", 0):,} calculated' if has_tam else 'TAM/SAM/SOM market sizing not completed',
        'score': 100 if has_tam else 0
    })

    # 3. Competitor Benchmarking Evidence
    comp_count = len(competitors)
    checks.append({
        'pillar': 'Competitor Evidence',
        'status': 'verified' if comp_count >= 3 else ('partial' if comp_count > 0 else 'missing'),
        'details': f'{comp_count} competitors mapped' if comp_count > 0 else 'No competitors analyzed',
        'score': 100 if comp_count >= 3 else (50 if comp_count > 0 else 0)
    })

    # 4. Financial Plan Evidence
    has_financials = bool(financials and financials.get('price', 0) > 0 and financials.get('expected_customers', 0) > 0)
    checks.append({
        'pillar': 'Financial Simulator Evidence',
        'status': 'verified' if has_financials else 'missing',
        'details': 'Cost structure and unit pricing modeled' if has_financials else 'Financial assumptions not yet filled',
        'score': 100 if has_financials else 0
    })

    # 5. MVP & Problem Definition
    has_mvp = bool(idea.get('unique_value_proposition') and idea.get('proposed_solution') and idea.get('problem_statement'))
    checks.append({
        'pillar': 'Problem & Solution Definition',
        'status': 'verified' if has_mvp else 'partial',
        'details': 'Problem, solution, and UVP clearly structured' if has_mvp else 'Incomplete problem or UVP specification',
        'score': 100 if has_mvp else 40
    })

    # 6. Risk Mitigation Evidence
    risk_count = len(risks)
    checks.append({
        'pillar': 'Risk Assessment Evidence',
        'status': 'verified' if risk_count >= 3 else ('partial' if risk_count > 0 else 'missing'),
        'details': f'{risk_count} risks identified with mitigation plans' if risk_count > 0 else 'No risk registry created',
        'score': 100 if risk_count >= 3 else (40 if risk_count > 0 else 0)
    })

    total_score = sum(c['score'] for c in checks) / len(checks)
    
    if total_score >= 75:
        confidence = 'High'
    elif total_score >= 40:
        confidence = 'Moderate'
    else:
        confidence = 'Low'

    return {
        'coverage_percentage': round(total_score, 1),
        'confidence_level': confidence,
        'pillars': checks
    }

def evaluate_idea(
    idea: Dict[str, Any],
    surveys: List[Dict[str, Any]],
    responses: List[Dict[str, Any]],
    competitors: List[Dict[str, Any]],
    financials: Optional[Dict[str, Any]],
    market: Optional[Dict[str, Any]],
    risks: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Deterministic scoring engine calculating readiness based on available evidence.
    Does not allow Gemini to invent the score.
    """
    supporting_evidence = []
    missing_evidence = []

    # 1. Customer Problem and Demand (25%)
    demand_pts = 0
    if idea.get('problem_statement') and len(idea.get('problem_statement', '')) > 30:
        demand_pts += 25
        supporting_evidence.append('Articulated specific problem statement.')
    else:
        missing_evidence.append('Problem statement is missing or too brief.')

    if idea.get('target_customers') and len(idea.get('target_customers', '')) > 10:
        demand_pts += 15
        supporting_evidence.append('Target customer segment clearly defined.')
    else:
        missing_evidence.append('Target customer segment needs sharper definition.')

    resp_count = len(responses)
    if resp_count >= 10:
        demand_pts += 40
        supporting_evidence.append(f'Validated with {resp_count} real customer survey responses.')
    elif resp_count >= 3:
        demand_pts += 25
        supporting_evidence.append(f'Early customer feedback gathered ({resp_count} responses).')
    elif resp_count > 0:
        demand_pts += 15
        missing_evidence.append('Survey sample size is below statistical significance (under 3 responses).')
    else:
        missing_evidence.append('Zero customer survey responses collected. Demand is unverified.')

    # Positive survey signal
    if resp_count > 0:
        # Check rating scale or willingness answers
        ratings = []
        for r in responses:
            for ans in r.get('answers', {}).values():
                if isinstance(ans, (int, float)) and 1 <= ans <= 5:
                    ratings.append(ans)
        avg_rating = sum(ratings) / len(ratings) if ratings else 3.5
        if avg_rating >= 4.0:
            demand_pts += 20
            supporting_evidence.append(f'Strong customer interest signal (average rating {avg_rating:.1f}/5.0).')
        elif avg_rating >= 3.0:
            demand_pts += 10
        else:
            missing_evidence.append(f'Customer interest rating is lukewarm ({avg_rating:.1f}/5.0).')
    else:
        demand_pts += 5  # Baseline

    customer_demand_score = min(100, demand_pts)

    # 2. Market Opportunity (20%)
    market_pts = 0
    if idea.get('industry') and idea.get('target_geography'):
        market_pts += 25
        supporting_evidence.append(f"Industry ({idea.get('industry')}) and geography ({idea.get('target_geography')}) scoped.")
    
    if market and market.get('tam_usd', 0) > 0:
        tam = market.get('tam_usd', 0)
        sam = market.get('sam_usd', 0)
        som = market.get('som_usd', 0)
        if tam >= sam >= som and som > 0:
            market_pts += 45
            supporting_evidence.append(f'TAM (${tam:,}), SAM (${sam:,}), and SOM (${som:,}) bottom-up calculated.')
        else:
            market_pts += 25
            missing_evidence.append('Market sizing values do not follow TAM >= SAM >= SOM hierarchy.')
    else:
        missing_evidence.append('TAM/SAM/SOM market sizing calculation is missing.')

    if market and market.get('trends'):
        market_pts += 30
        supporting_evidence.append('Market growth trends and tailwinds documented.')
    else:
        missing_evidence.append('Industry trend analysis and tailwinds not yet documented.')

    market_opp_score = min(100, market_pts)

    # 3. Competitor Differentiation (15%)
    comp_pts = 0
    if idea.get('unique_value_proposition') and len(idea.get('unique_value_proposition', '')) > 20:
        comp_pts += 35
        supporting_evidence.append('Documented unique value proposition (UVP).')
    else:
        missing_evidence.append('Unique value proposition (UVP) is unclear or missing.')

    comp_count = len(competitors)
    if comp_count >= 3:
        comp_pts += 45
        supporting_evidence.append(f'{comp_count} direct and indirect competitors profiled with strengths/weaknesses.')
    elif comp_count >= 1:
        comp_pts += 25
        missing_evidence.append(f'Only {comp_count} competitor profiled. Recommend mapping at least 3.')
    else:
        missing_evidence.append('Zero competitors added to matrix. Competitive landscape is blind.')

    if idea.get('current_alternatives'):
        comp_pts += 20
        supporting_evidence.append('Current customer alternatives and workarounds identified.')

    competitor_diff_score = min(100, comp_pts)

    # 4. Technical Feasibility (15%)
    tech_pts = 0
    if idea.get('team_skills'):
        tech_pts += 35
        supporting_evidence.append(f"Team skills declared: {idea.get('team_skills')}.")
    else:
        missing_evidence.append('Team technical capabilities and execution skills not specified.')

    if idea.get('proposed_solution') and len(idea.get('proposed_solution', '')) > 30:
        tech_pts += 35
        supporting_evidence.append('Proposed product architecture and solution workflow defined.')

    tech_risks = [r for r in risks if r.get('category') == 'Technical feasibility']
    if tech_risks:
        tech_pts += 30
        supporting_evidence.append('Technical risks mapped with mitigation plans.')
    else:
        missing_evidence.append('Technical feasibility risks have not been evaluated.')

    tech_feas_score = min(100, tech_pts)

    # 5. Financial Viability (15%)
    fin_pts = 0
    if financials and financials.get('price', 0) > 0:
        price = financials.get('price', 0)
        var_cost = financials.get('variable_costs', 0)
        margin = ((price - var_cost) / price) if price > 0 else 0
        if margin > 0.4:
            fin_pts += 40
            supporting_evidence.append(f'Healthy unit contribution margin ({margin*100:.1f}%).')
        elif margin > 0:
            fin_pts += 25
            supporting_evidence.append(f'Positive contribution margin ({margin*100:.1f}%).')
        else:
            missing_evidence.append('Negative contribution margin (variable costs exceed price).')
        
        break_even_customers = financials.get('break_even_customers', 0)
        if break_even_customers > 0 and break_even_customers < 2000:
            fin_pts += 35
            supporting_evidence.append(f'Realistic break-even target ({break_even_customers} customers).')
        else:
            fin_pts += 15

        if financials.get('initial_investment', 0) > 0 or idea.get('available_budget'):
            fin_pts += 25
            supporting_evidence.append('Initial capital requirements and available budget defined.')
    else:
        missing_evidence.append('Financial feasibility simulator inputs incomplete (pricing, cost of goods, opex).')

    fin_viab_score = min(100, fin_pts)

    # 6. Evidence Quality (10%)
    ev_pts = 0
    coverage_data = calculate_evidence_coverage(idea, surveys, responses, competitors, financials, market, risks)
    ev_pts = int(coverage_data['coverage_percentage'])
    evidence_qual_score = min(100, ev_pts)

    # Criterion breakdown
    criterion_scores = {
        'customer_problem_and_demand': customer_demand_score,
        'market_opportunity': market_opp_score,
        'competitor_differentiation': competitor_diff_score,
        'technical_feasibility': tech_feas_score,
        'financial_viability': fin_viab_score,
        'evidence_quality': evidence_qual_score,
    }

    # Deterministic weighted calculation
    raw_overall_score = sum(criterion_scores[cat] * WEIGHTS[cat] for cat in WEIGHTS)

    # Apply evidence coverage damping if evidence is critically low:
    coverage_ratio = coverage_data['coverage_percentage'] / 100.0
    # If coverage is below 35%, overall readiness score cannot exceed 50
    if coverage_ratio < 0.35:
        overall_score = round(min(raw_overall_score, raw_overall_score * (0.6 + 0.4 * coverage_ratio)), 1)
    else:
        overall_score = round(raw_overall_score, 1)

    # Determine recommendation band
    band_info = RECOMMENDATION_BANDS[0]
    for b in RECOMMENDATION_BANDS:
        if b['range'][0] <= overall_score <= b['range'][1]:
            band_info = b
            break

    # Recommended next actions
    recommended_actions = []
    if resp_count < 5:
        recommended_actions.append('Deploy the customer validation survey and collect at least 15 verified responses from target users.')
    if comp_count < 3:
        recommended_actions.append('Identify and document at least 3 direct or alternative solutions to define a defensible moat.')
    if not (market and market.get('tam_usd')):
        recommended_actions.append('Calculate bottom-up TAM, SAM, and SOM in Market Intelligence to establish realistic addressable revenue.')
    if not financials or not financials.get('price'):
        recommended_actions.append('Run the Financial Simulator with pricing, variable unit costs, and monthly fixed burn rate.')
    if len(risks) < 3:
        recommended_actions.append('Populate the Risk Matrix with market, operational, and technical risks with designated mitigation owners.')
    if overall_score >= 60:
        recommended_actions.append('Build a clickable interactive prototype to conduct recorded user walkthroughs.')
        recommended_actions.append('Test pricing sensitivity with target customers through pre-orders or letters of intent (LOI).')

    return {
        'overall_score': overall_score,
        'criterion_scores': criterion_scores,
        'scoring_weights': {k: int(v * 100) for k, v in WEIGHTS.items()},
        'recommendation_band': band_info['band'],
        'recommendation_guidance': band_info['guidance'],
        'score_explanation': (
            f"The validation score of {overall_score}/100 measures product readiness based on available empirical evidence, "
            f"not guaranteed business success. Your current evidence coverage is {coverage_data['coverage_percentage']}%, "
            f"yielding a {coverage_data['confidence_level'].lower()} confidence evaluation."
        ),
        'evidence_coverage': coverage_data,
        'supporting_evidence': supporting_evidence,
        'missing_evidence': missing_evidence,
        'recommended_next_actions': recommended_actions,
    }
