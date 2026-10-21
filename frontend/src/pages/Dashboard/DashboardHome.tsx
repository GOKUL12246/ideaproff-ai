import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { DashboardSummary } from '../../types';
import {
  Sparkles,
  Lightbulb,
  FileCheck2,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  PlusCircle,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { user, activeIdea, ideas, setActiveIdea, refreshIdeas } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [activeIdea]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.summary();
      setSummary(res);
    } catch (e) {
      console.error("Failed to load dashboard summary:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const res = await api.ideas.seedDemo();
      const list = await refreshIdeas();
      const demo = list.find((i) => i.id === res.demo_data?.idea_id);
      if (demo) setActiveIdea(demo);
      await loadSummary();
    } catch (e: any) {
      alert(e.message || "Failed to seed demo");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-blue-900/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>AI-Assisted Startup Idea Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Founder'}!
          </h1>
          <p className="mt-2 text-xs md:text-sm text-blue-100 leading-relaxed">
            {activeIdea
              ? `Currently validating '${activeIdea.title}'. Track your empirical demand, customer feedback, and unit economics below.`
              : 'Start by creating your first startup idea or explore our pre-populated collegiate showcase to see how validation scoring works.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/app/ideas/new"
            className="inline-flex items-center space-x-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Create New Idea</span>
          </Link>
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="inline-flex items-center space-x-2 bg-teal-500/30 hover:bg-teal-500/40 text-teal-100 border border-teal-300/40 font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>{seeding ? "Loading..." : "Load Showcase Startup"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Ideas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900">{summary?.total_ideas ?? 0}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{summary?.ideas_under_validation ?? 0} under validation</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Evidence Coverage</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-teal-600">{summary?.average_evidence_coverage ?? 0}%</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Across 6 validation pillars</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Survey Responses</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-indigo-600">{summary?.total_responses ?? 0}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">From {summary?.total_surveys ?? 0} active surveys</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Diligence Reports</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-600">{summary?.completed_reports ?? 0}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Generated PDF dossiers</p>
          </div>
        </div>
      </div>

      {/* Active Idea Spotlight & Quick Navigation */}
      {activeIdea ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Startup In Focus</span>
                {activeIdea.is_demo && (
                  <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    DEMO DATA
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{activeIdea.title}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Industry: <strong className="text-slate-700">{activeIdea.industry}</strong> | Geography: <strong className="text-slate-700">{activeIdea.target_geography || 'Global'}</strong> | Stage: <strong className="text-slate-700">{activeIdea.development_stage}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/app/ideas/${activeIdea.id}/workspace`}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Workspace</span>
              </Link>
              <Link
                to="/app/validation"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl transition-colors"
              >
                <span>Validation Score</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Core Problem & UVP Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Problem Statement</h3>
              <p className="text-xs text-slate-800 mt-2 leading-relaxed">
                {activeIdea.problem_statement || "No problem statement specified yet."}
              </p>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unique Value Proposition</h3>
              <p className="text-xs text-slate-800 mt-2 leading-relaxed">
                {activeIdea.unique_value_proposition || "No unique value proposition specified yet."}
              </p>
            </div>
          </div>

          {/* Quick Modules Jump Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Validation Modules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <Link to="/app/market" className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center text-center transition-all">
                <TrendingUp className="w-5 h-5 text-teal-600 mb-1.5" />
                <span className="font-semibold text-slate-800">Market</span>
                <span className="text-[10px] text-slate-500">TAM/SAM/SOM</span>
              </Link>

              <Link to="/app/surveys" className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center text-center transition-all">
                <ClipboardCheck className="w-5 h-5 text-indigo-600 mb-1.5" />
                <span className="font-semibold text-slate-800">Surveys</span>
                <span className="text-[10px] text-slate-500">Customer voice</span>
              </Link>

              <Link to="/app/competitors" className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center text-center transition-all">
                <Layers className="w-5 h-5 text-amber-600 mb-1.5" />
                <span className="font-semibold text-slate-800">Competitors</span>
                <span className="text-[10px] text-slate-500">Diff matrix</span>
              </Link>

              <Link to="/app/financial" className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center text-center transition-all">
                <TrendingUp className="w-5 h-5 text-emerald-600 mb-1.5" />
                <span className="font-semibold text-slate-800">Financials</span>
                <span className="text-[10px] text-slate-500">Unit economics</span>
              </Link>

              <Link to="/app/risks" className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center text-center transition-all">
                <AlertTriangle className="w-5 h-5 text-rose-600 mb-1.5" />
                <span className="font-semibold text-slate-800">Risks</span>
                <span className="text-[10px] text-slate-500">5x5 Matrix</span>
              </Link>

              <Link to="/app/roadmap" className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center text-center transition-all">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mb-1.5" />
                <span className="font-semibold text-slate-800">Roadmap</span>
                <span className="text-[10px] text-slate-500">7 to 30 days</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Startup Idea Selected</h2>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Create a new startup concept to begin validating assumptions, or load our complete demo startup to explore every feature.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app/ideas/new"
              className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Startup Idea</span>
            </Link>
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>{seeding ? "Loading Demo..." : "Load Demo Idea"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Two Columns: Recent Activity & Pending Roadmap Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Logs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              </div>
              <Link to="/app/team" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {summary?.recent_activity && summary.recent_activity.length > 0 ? (
                summary.recent_activity.map((act) => (
                  <div key={act.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{act.action}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{act.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Pending Roadmap Tasks */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Pending Validation Tasks</h3>
              </div>
              <Link to="/app/roadmap" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Full Roadmap
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {summary?.pending_tasks && summary.pending_tasks.length > 0 ? (
                summary.pending_tasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{task.timeframe} • Owner: {task.assigned_user}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No pending roadmap tasks.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
