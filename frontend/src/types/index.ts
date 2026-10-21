export type UserRole = 'Student' | 'Startup Founder' | 'Mentor' | 'Incubator Administrator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface KeyAssumption {
  assumption: string;
  risk_level: string;
  validation_method: string;
}

export interface ValidationExperiment {
  experiment_name: string;
  hypothesis: string;
  metric: string;
  target_threshold: string;
}

export interface IdeaAnalysisData {
  refined_problem_statement: string;
  proposed_solution_summary: string;
  target_customer_segments: string[];
  customer_pain_point_hypotheses: string[];
  unique_value_proposition: string;
  potential_revenue_models: string[];
  key_assumptions: Array<{ assumption: string; risk_level: string; validation_method: string }>;
  mvp_recommendations: string[];
  initial_validation_experiments: Array<{ experiment_name: string; hypothesis: string; metric: string; target_threshold: string }>;
  is_live_ai: boolean;
  model_used: string;
}

export interface StartupIdea {
  id: string;
  user_id: string;
  title: string;
  industry: string;
  problem_statement: string;
  proposed_solution: string;
  target_customers: string;
  target_geography: string;
  current_alternatives: string;
  unique_value_proposition: string;
  available_budget: string;
  team_skills: string;
  business_model: string;
  development_stage: string;
  is_demo?: boolean;
  ai_refined_data?: IdeaAnalysisData | null;
  survey_count?: number;
  competitor_count?: number;
  validation_score?: number | null;
  recommendation_band?: string;
  created_at: string;
  updated_at: string;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'rating_scale' | 'short_answer' | 'long_answer';

export interface SurveyQuestion {
  id: string;
  question_text: string;
  question_type: QuestionType;
  is_required: boolean;
  options?: string[];
  scale_min?: number;
  scale_max?: number;
}

export interface Survey {
  id: string;
  idea_id: string;
  title: string;
  description: string;
  token: string;
  status: 'draft' | 'published' | 'closed';
  questions: SurveyQuestion[];
  response_count?: number;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  token: string;
  answers: Record<string, any>;
  submitted_at: string;
}

export interface Competitor {
  id: string;
  idea_id: string;
  name: string;
  website: string;
  product_description: string;
  features: string;
  pricing: string;
  target_customers: string;
  strengths: string;
  weaknesses: string;
  last_verified_date: string;
  source_references: string;
  created_at: string;
}

export interface FinancialAssumptions {
  idea_id: string;
  initial_investment: number;
  development_costs: number;
  monthly_opex: number;
  product_price: number;
  expected_customers: number;
  variable_costs: number;
  marketing_expenses: number;
  staffing_costs: number;
  monthly_growth: number;
}

export interface MonthlyFinancialPoint {
  month: number;
  customers: number;
  revenue: number;
  variable_costs: number;
  fixed_expenses: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  cumulative_cash_flow: number;
}

export interface FinancialScenario {
  scenario: string;
  upfront_investment: number;
  fixed_monthly_costs: number;
  unit_contribution: number;
  contribution_margin_percentage: number;
  break_even_customers: number;
  estimated_break_even_month: number | string;
  year_total_revenue: number;
  year_total_expenses: number;
  year_net_profit: number;
  monthly_projections: MonthlyFinancialPoint[];
}

export interface FinancialSimulationResult {
  inputs: FinancialAssumptions;
  formulas: Record<string, string>;
  base: FinancialScenario;
  conservative: FinancialScenario;
  optimistic: FinancialScenario;
  disclaimer: string;
}

export interface EvidenceCoveragePillar {
  pillar: string;
  status: 'verified' | 'partial' | 'missing';
  details: string;
  score: number;
}

export interface EvidenceCoverage {
  coverage_percentage: number;
  confidence_level: 'High' | 'Moderate' | 'Low';
  pillars: EvidenceCoveragePillar[];
}

export interface ValidationScore {
  overall_score: number;
  criterion_scores: {
    customer_problem_and_demand: number;
    market_opportunity: number;
    competitor_differentiation: number;
    technical_feasibility: number;
    financial_viability: number;
    evidence_quality: number;
  };
  scoring_weights: Record<string, number>;
  recommendation_band: string;
  recommendation_guidance: string;
  score_explanation: string;
  evidence_coverage: EvidenceCoverage;
  supporting_evidence: string[];
  missing_evidence: string[];
  recommended_next_actions: string[];
}

export interface RiskItem {
  id?: string;
  idea_id?: string;
  category: string;
  description: string;
  likelihood: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  supporting_evidence: string;
  mitigation_plan: string;
  assigned_owner: string;
  status: 'Active' | 'Mitigated' | 'Monitoring';
  created_at?: string;
}

export interface RoadmapTask {
  id: string;
  idea_id: string;
  timeframe: 'Next 7 days' | 'Next 14 days' | 'Next 30 days' | 'Long-term milestones';
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline_days: number;
  assigned_user: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  expected_outcome: string;
  created_at: string;
}

export interface ReportItem {
  id: string;
  idea_id: string;
  title: string;
  report_data: any;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  idea_id?: string;
  action: string;
  details: string;
  created_at: string;
}

export interface DashboardSummary {
  total_ideas: number;
  ideas_under_validation: number;
  completed_reports: number;
  total_surveys: number;
  total_responses: number;
  average_evidence_coverage: number;
  average_validation_score: number | null;
  recent_activity: ActivityLog[];
  pending_tasks: RoadmapTask[];
}
