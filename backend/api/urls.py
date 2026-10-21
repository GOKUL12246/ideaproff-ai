from django.urls import path
from .views import (
    HealthCheckView,
    RegisterView,
    LoginView,
    CurrentUserView,
    StartupIdeaListCreateView,
    StartupIdeaDetailView,
    DemoSeedView,
    IdeaAnalyzeAIView,
    MarketResearchAIView,
    CompetitorAnalysisAIView,
    FullValidationRunAIView,
    SurveyListCreateView,
    SurveyDetailView,
    SurveyGenerateQuestionsAIView,
    PublicSurveyView,
    PublicSurveySubmitResponseView,
    SurveyAnalyticsView,
    SurveyExportCSVView,
    CompetitorListCreateView,
    CompetitorDetailView,
    FinancialSimulationView,
    RiskListCreateView,
    RiskDetailView,
    RoadmapListCreateView,
    RoadmapDetailView,
    ReportListCreateView,
    ReportDetailDownloadView,
    DashboardSummaryView,
    ActivityLogListView,
    TeamWorkspaceView
)

urlpatterns = [
    # Health Check
    path('health', HealthCheckView.as_view(), name='health-check'),
    path('health/', HealthCheckView.as_view(), name='health-check-slash'),

    # Auth
    path('auth/register', RegisterView.as_view(), name='auth-register'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/me', CurrentUserView.as_view(), name='auth-me'),

    # Startup Ideas & Demo
    path('ideas', StartupIdeaListCreateView.as_view(), name='ideas-list-create'),
    path('ideas/demo/seed', DemoSeedView.as_view(), name='ideas-demo-seed'),
    path('ideas/<str:id>', StartupIdeaDetailView.as_view(), name='ideas-detail'),

    # AI Intelligence Modules
    path('ideas/<str:id>/analyze', IdeaAnalyzeAIView.as_view(), name='ideas-analyze'),
    path('ideas/<str:id>/market-research', MarketResearchAIView.as_view(), name='ideas-market-research'),
    path('ideas/<str:id>/competitor-analysis', CompetitorAnalysisAIView.as_view(), name='ideas-competitor-analysis'),
    path('ideas/<str:id>/validate', FullValidationRunAIView.as_view(), name='ideas-validate'),

    # Customer Surveys
    path('ideas/<str:id>/surveys', SurveyListCreateView.as_view(), name='surveys-list-create'),
    path('surveys/generate-questions', SurveyGenerateQuestionsAIView.as_view(), name='surveys-generate-questions'),
    path('surveys/<str:id>', SurveyDetailView.as_view(), name='surveys-detail'),
    path('surveys/<str:id>/analytics', SurveyAnalyticsView.as_view(), name='surveys-analytics'),
    path('surveys/<str:id>/export-csv', SurveyExportCSVView.as_view(), name='surveys-export-csv'),
    path('public/surveys/<str:token>', PublicSurveyView.as_view(), name='public-survey'),
    path('public/surveys/<str:token>/responses', PublicSurveySubmitResponseView.as_view(), name='public-survey-submit'),

    # Competitor Analysis
    path('ideas/<str:id>/competitors', CompetitorListCreateView.as_view(), name='competitors-list-create'),
    path('competitors/<str:id>', CompetitorDetailView.as_view(), name='competitor-detail'),

    # Financial Feasibility
    path('ideas/<str:id>/financial-analysis', FinancialSimulationView.as_view(), name='ideas-financial-analysis'),

    # Risks & Roadmap
    path('ideas/<str:id>/risks', RiskListCreateView.as_view(), name='risks-list-create'),
    path('risks/<str:id>', RiskDetailView.as_view(), name='risk-detail'),
    path('ideas/<str:id>/roadmap', RoadmapListCreateView.as_view(), name='roadmap-list-create'),
    path('roadmap/<str:id>', RoadmapDetailView.as_view(), name='roadmap-detail'),

    # Reports
    path('ideas/<str:id>/reports', ReportListCreateView.as_view(), name='reports-list-create'),
    path('reports/<str:id>/download', ReportDetailDownloadView.as_view(), name='report-download'),

    # Dashboard & Team
    path('dashboard/summary', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('activity', ActivityLogListView.as_view(), name='activity-list'),
    path('team', TeamWorkspaceView.as_view(), name='team-workspace'),
    path('team/invite', TeamWorkspaceView.as_view(), name='team-invite'),
]
