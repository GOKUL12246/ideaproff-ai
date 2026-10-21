import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ValidationScore } from '../../types';
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  Layers,
  Flame,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ValidationScoring: React.FC = () => {
  const { activeIdea, refreshIdeas } = useAuth();
  const [scoreData, setScoreData] = useState<ValidationScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeIdea) {
      loadScore();
    } else {
      setLoading(false);
    }
  }, [activeIdea?.id]);

  const loadScore = async () => {
    if (!activeIdea) return;
    try {
      setLoading(true);
      const res = await api.ideas.get(activeIdea.id);
      if (res.latest_score) {
        setScoreData(res.latest_score);
      }
    } catch (e) {
      console.error("Failed to load validation score:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullValidation = async () => {
    if (!activeIdea) return;
    try {
      setValidating(true);
      const res = await api.ai.validateFull(activeIdea.id);
      if (res.validation_report?.validation_score) {
        setScoreData(res.validation_report.validation_score);
      }
      setMessage("Full AI validation dossier and deterministic readiness score compiled!");
      await refreshIdeas();
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Failed to run validation");
    } finally {
      setValidating(false);
    }
  };

  if (!activeIdea) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Active Startup Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select an active idea from the navbar to evaluate validation score.</p>
      </div>
    );
  }

  // Prep Chart Data for Criteria
  const chartData = scoreData ? [
    { name: 'Problem & Demand', score: scoreData.criterion_scores.customer_problem_and_demand, weight: '25%' },
    { name: 'Market Opportunity', score: scoreData.criterion_scores.market_opportunity, weight: '20%' },
    { name: 'Competitor Moat', score: scoreData.criterion_scores.competitor_differentiation, weight: '15%' },
    { name: 'Tech Feasibility', score: scoreData.criterion_scores.technical_feasibility, weight: '15%' },
    { name: 'Financial Viability', score: scoreData.criterion_scores.financial_viability, weight: '15%' },
    { name: 'Evidence Quality', score: scoreData.criterion_scores.evidence_quality, weight: '10%' },
  ] : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deterministic Validation Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Readiness Scoring — {activeIdea.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical validation score weighted across 6 criteria. Not an AI hallucination.
          </p>
        </div>

        <button
          onClick={handleRunFullValidation}
          disabled={validating}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{validating ? "Running Full AI Orchestrator..." : "Run Full Validation Audit"}</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Methodology Notice */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 flex items-start space-x-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Validation Framework Notice:</strong> This score measures <em>product-market readiness based on available empirical evidence</em>, 
          not a guarantee of business success. Low evidence coverage automatically penalizes confidence and bounds optimistic projections.
        </div>
      </div>

      {scoreData ? (
        <div className="space-y-6">
          {/* Top Score Banner & Band */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score Circle */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Readiness Score</span>
              <div className="mt-4 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-900">{scoreData.overall_score}</span>
                    <span className="block text-[11px] font-bold text-slate-400">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full border ${getScoreColor(scoreData.overall_score)}`}>
                  {scoreData.recommendation_band}
                </span>
              </div>
            </div>

            {/* Evidence Coverage & Confidence */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence Coverage</span>
                <p className="text-3xl font-extrabold text-teal-600 mt-2">
                  {scoreData.evidence_coverage.coverage_percentage}%
                </p>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3">
                  <div
                    className="bg-teal-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, scoreData.evidence_coverage.coverage_percentage)}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Confidence Level:</span>
                  <strong className={`font-bold ${
                    scoreData.evidence_coverage.confidence_level === 'High' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {scoreData.evidence_coverage.confidence_level}
                  </strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                {scoreData.evidence_coverage.pillars.slice(0, 3).map((pil, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-2">{pil.pillar}:</span>
                    <span className={pil.status === 'verified' ? 'font-bold text-emerald-600' : 'text-slate-400'}>
                      {pil.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendation */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scoring Recommendation</span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {scoreData.recommendation_band}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {scoreData.recommendation_guidance}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to="/app/roadmap"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>View Actionable Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Criterion Breakdown Bar Chart & Scoring Weights */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Deterministic Criterion Performance</h3>
                <p className="text-xs text-slate-500">Fixed scoring weights sum to 100%. Scores calibrated by empirical data.</p>
              </div>
              <span className="text-xs text-slate-400">Scale: 0 to 100</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [`${val} / 100 (Weight: ${item.payload.weight})`, 'Criterion Score']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 70 ? '#10b981' : (entry.score >= 50 ? '#3b82f6' : '#f59e0b')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supporting Evidence vs Critical Missing Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supporting Evidence */}
            <div className="bg-emerald-50/40 rounded-3xl p-6 border border-emerald-200 space-y-3">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Supporting Empirical Evidence</span>
              </h3>
              <div className="space-y-2">
                {(scoreData.supporting_evidence || []).map((ev, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-emerald-100 text-xs text-slate-800 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Evidence Gaps */}
            <div className="bg-rose-50/40 rounded-3xl p-6 border border-rose-200 space-y-3">
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Critical Missing Evidence (Risks)</span>
              </h3>
              <div className="space-y-2">
                {(scoreData.missing_evidence || []).map((ev, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-rose-100 text-xs text-slate-800 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Next Actions */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recommended Next Validation Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(scoreData.recommended_next_actions || []).map((act, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug font-medium">{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Run Validation Engine</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Synthesize all surveys, competitors, financial models, and customer pain points to generate an empirical readiness score.
          </p>
          <button
            onClick={handleRunFullValidation}
            disabled={validating}
            className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{validating ? "Running..." : "Evaluate Startup Readiness"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
