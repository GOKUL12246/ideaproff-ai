import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/Landing/LandingPage';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHome } from './pages/Dashboard/DashboardHome';
import { IdeasList } from './pages/Ideas/IdeasList';
import { CreateIdea } from './pages/Ideas/CreateIdea';
import { IdeaWorkspace } from './pages/Ideas/IdeaWorkspace';
import { MarketIntelligence } from './pages/Market/MarketIntelligence';
import { SharemarketAnalysisView } from './pages/Sharemarket/SharemarketAnalysis';
import { SurveyList } from './pages/Surveys/SurveyList';
import { SurveyAnalyticsView } from './pages/Surveys/SurveyAnalyticsView';
import { CompetitorAnalysis } from './pages/Competitors/CompetitorAnalysis';
import { FinancialSimulator } from './pages/Financial/FinancialSimulator';
import { ValidationScoring } from './pages/Validation/ValidationScoring';
import { RiskAssessment } from './pages/Risks/RiskAssessment';
import { StartupRoadmap } from './pages/Roadmap/StartupRoadmap';
import { ReportsView } from './pages/Reports/ReportsView';
import { TeamWorkspace } from './pages/Team/TeamWorkspace';
import { SettingsView } from './pages/Settings/SettingsView';
import { PublicSurveyPage } from './pages/PublicSurvey/PublicSurveyPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-medium">
        Authenticating IdeaProof AI session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Survey Respondent Link */}
          <Route path="/public/surveys/:token" element={<PublicSurveyPage />} />

          {/* Protected App Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="ideas" element={<IdeasList />} />
            <Route path="ideas/new" element={<CreateIdea />} />
            <Route path="ideas/:id/workspace" element={<IdeaWorkspace />} />
            <Route path="market" element={<MarketIntelligence />} />
            <Route path="sharemarket" element={<SharemarketAnalysisView />} />
            <Route path="surveys" element={<SurveyList />} />
            <Route path="surveys/:id/analytics" element={<SurveyAnalyticsView />} />
            <Route path="competitors" element={<CompetitorAnalysis />} />
            <Route path="financial" element={<FinancialSimulator />} />
            <Route path="validation" element={<ValidationScoring />} />
            <Route path="risks" element={<RiskAssessment />} />
            <Route path="roadmap" element={<StartupRoadmap />} />
            <Route path="reports" element={<ReportsView />} />
            <Route path="team" element={<TeamWorkspace />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
