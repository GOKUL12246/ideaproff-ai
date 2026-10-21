from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class KeyAssumption(BaseModel):
    assumption: str
    risk_level: str = "Medium"
    validation_method: str

class ValidationExperiment(BaseModel):
    experiment_name: str
    hypothesis: str
    metric: str
    target_threshold: str

class IdeaAnalysisOutput(BaseModel):
    refined_problem_statement: str
    proposed_solution_summary: str
    target_customer_segments: List[str]
    customer_pain_point_hypotheses: List[str]
    unique_value_proposition: str
    potential_revenue_models: List[str]
    key_assumptions: List[KeyAssumption]
    mvp_recommendations: List[str]
    initial_validation_experiments: List[ValidationExperiment]
    is_live_ai: bool = False
    model_used: str = "heuristic-fallback"

class MarketResearchOutput(BaseModel):
    industry_overview: str
    target_customer_segments: List[str]
    market_trends: List[str]
    market_opportunities: List[str]
    tam_sam_som_analysis: Dict[str, Any]
    source_linked_findings: List[Dict[str, str]]
    market_assumptions: List[str]
    evidence_quality_indicators: str
    is_live_ai: bool = False
    model_used: str = "heuristic-fallback"

class CustomerValidationOutput(BaseModel):
    total_responses_analyzed: int
    primary_pain_points: List[Dict[str, Any]]
    interest_in_solution_summary: str
    willingness_to_pay_insights: str
    customer_objections: List[str]
    common_feedback_themes: List[str]
    recommended_product_adjustments: List[str]
    is_live_ai: bool = False
    model_used: str = "heuristic-fallback"

class CompetitorAnalysisOutput(BaseModel):
    competitive_landscape_summary: str
    differentiation_opportunities: List[str]
    white_space_opportunities: List[str]
    pricing_benchmarks: str
    is_live_ai: bool = False
    model_used: str = "heuristic-fallback"

class FinancialAnalysisOutput(BaseModel):
    financial_executive_summary: str
    burn_rate_and_runway_assessment: str
    unit_economics_health: str
    break_even_realism: str
    financial_risks: List[str]
    improvement_recommendations: List[str]
    is_live_ai: bool = False
    model_used: str = "heuristic-fallback"

class RiskItem(BaseModel):
    category: str
    description: str
    likelihood: str  # Low, Medium, High
    impact: str      # Low, Medium, High
    severity: str    # Low, Medium, High, Critical
    supporting_evidence: str
    mitigation_plan: str
    assigned_owner: str = "Founding Team"
    status: str = "Active"

class RiskAssessmentOutput(BaseModel):
    risks: List[RiskItem]
    is_live_ai: bool = False
    model_used: str = "heuristic-fallback"

class RoadmapTaskItem(BaseModel):
    title: str
    description: str
    timeframe: str  # Next 7 days, Next 14 days, Next 30 days, Long-term milestones
    priority: str   # High, Medium, Low
    deadline_days: int
    assigned_user: str
    status: str = "Pending"  # Pending, In Progress, Completed
    expected_outcome: str

class PublicCompTicker(BaseModel):
    ticker: str
    company_name: str
    exchange: str
    market_cap: str
    ev_revenue: str
    pe_ratio: str
    annual_revenue: str
    relevance_to_startup: str

class SharemarketAnalysisOutput(BaseModel):
    sector_name: str
    market_sentiment: str  # Bullish, Neutral, Cautious
    sentiment_rationale: str
    public_comps: List[PublicCompTicker]
    median_ev_revenue_multiple: str
    median_pe_multiple: str
    public_gross_margin_benchmark: str
    rule_of_40_target: str
    ipo_readiness_benchmark: Dict[str, str]
    ma_exit_opportunities: List[Dict[str, str]]
    public_market_risks: List[str]
    is_live_ai: bool = False
    model_used: str = "gemini-3.5-flash"
