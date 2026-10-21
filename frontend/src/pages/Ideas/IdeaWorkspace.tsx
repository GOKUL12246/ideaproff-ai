import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { StartupIdea, IdeaAnalysisData } from '../../types';
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  Target,
  Lightbulb,
  ShieldAlert,
  Flame,
  FileText
} from 'lucide-react';

export const IdeaWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeIdea, setActiveIdea, refreshIdeas } = useAuth();
  const [idea, setIdea] = useState<StartupIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Editable analysis state
  const [analysis, setAnalysis] = useState<IdeaAnalysisData | null>(null);

  useEffect(() => {
    if (id && id !== 'select') {
      loadIdea(id);
    } else if (activeIdea) {
      loadIdea(activeIdea.id);
    } else {
      setLoading(false);
    }
  }, [id, activeIdea?.id]);

  const loadIdea = async (ideaId: string) => {
    try {
      setLoading(true);
      const res = await api.ideas.get(ideaId);
      setIdea(res.idea);
      if (res.idea.ai_refined_data) {
        setAnalysis(res.idea.ai_refined_data);
      }
    } catch (e: any) {
      console.error("Failed to load idea workspace:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!idea) return;
    try {
      setAnalyzing(true);
      const res = await api.ai.analyzeIdea(idea.id);
      setAnalysis(res.analysis);
      setMessage("AI Idea Intelligence synthesis generated successfully!");
      await refreshIdeas();
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Failed to run AI analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveWorkspace = async () => {
    if (!idea || !analysis) return;
    try {
      setSaving(true);
      await api.ideas.update(idea.id, {
        ai_refined_data: analysis
      });
      setMessage("Changes saved successfully to your idea workspace!");
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Failed to save workspace");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-slate-500">
        Loading Idea Intelligence Workspace...
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <Lightbulb className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Idea Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select an idea or create a new one to access the intelligence engine.</p>
        <Link to="/app/ideas" className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
          Go to My Ideas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Idea Intelligence Engine</span>
            {analysis && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                analysis.is_live_ai ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {analysis.is_live_ai ? `Live Gemini (${analysis.model_used})` : 'Heuristic Domain Engine'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {idea.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {idea.industry} • Stage: {idea.development_stage} • Geography: {idea.target_geography}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {analysis && (
            <button
              onClick={handleSaveWorkspace}
              disabled={saving}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Edits"}</span>
            </button>
          )}

          <button
            onClick={handleRunAIAnalysis}
            disabled={analyzing}
            className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{analyzing ? "Synthesizing Hypotheses..." : (analysis ? "Re-Run Analysis Agent" : "Run Idea Intelligence Agent")}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Disclaimers & Methodology Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 flex items-start space-x-3">
        <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Data Provenance Notice:</strong> The sections below distinguish user-provided assumptions from AI-generated hypotheses. 
          Use these structured outputs as testable hypotheses for customer interviews and surveys, rather than unverified business facts.
        </div>
      </div>

      {analysis ? (
        <div className="space-y-6">
          {/* Refined Problem & Solution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Refined Problem */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Refined Problem Statement</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-100">
                  AI Synthesized
                </span>
              </div>
              <textarea
                rows={4}
                value={analysis.refined_problem_statement}
                onChange={(e) => setAnalysis({ ...analysis, refined_problem_statement: e.target.value })}
                className="w-full text-xs text-slate-800 p-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">Click to edit directly. Focuses on user friction and cost of inaction.</p>
            </div>

            {/* Proposed Solution Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Proposed Solution Architecture</span>
                <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded border border-teal-100">
                  AI Synthesized
                </span>
              </div>
              <textarea
                rows={4}
                value={analysis.proposed_solution_summary}
                onChange={(e) => setAnalysis({ ...analysis, proposed_solution_summary: e.target.value })}
                className="w-full text-xs text-slate-800 p-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">Click to edit. Outlines core automated workflow.</p>
            </div>
          </div>

          {/* Unique Value Proposition & Potential Revenue Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unique Value Proposition (UVP)</span>
              </div>
              <textarea
                rows={3}
                value={analysis.unique_value_proposition}
                onChange={(e) => setAnalysis({ ...analysis, unique_value_proposition: e.target.value })}
                className="w-full text-xs text-slate-800 p-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
              />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Potential Revenue Models</span>
              <div className="space-y-2">
                {analysis.potential_revenue_models.map((model, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0" />
                    <span>{model}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Segments & Pain-Point Hypotheses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Customer Segments</span>
              <div className="space-y-2">
                {analysis.target_customer_segments.map((seg, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-800 flex items-start space-x-2">
                    <Target className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{seg}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Customer Pain-Point Hypotheses</span>
              <div className="space-y-2">
                {analysis.customer_pain_point_hypotheses.map((pain, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-800 flex items-start space-x-2">
                    <Flame className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{pain}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Assumptions & How To Test Them */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Key Assumptions & Verification Methods</h3>
              <span className="text-xs text-slate-400">Must be validated before scaling build</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.key_assumptions.map((assump, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Assumption #{idx + 1}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        assump.risk_level === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {assump.risk_level} Risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-900 font-medium leading-relaxed">{assump.assumption}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Validation Method:</p>
                    <p className="text-xs text-slate-700 mt-0.5">{assump.validation_method}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scoped MVP Recommendations & Validation Experiments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Scoped MVP Recommendations</h3>
              <div className="space-y-2">
                {analysis.mvp_recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Initial Validation Experiments</h3>
              <div className="space-y-2.5">
                {analysis.initial_validation_experiments.map((exp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                    <p className="font-bold text-blue-900">{exp.experiment_name}</p>
                    <p className="text-slate-600 text-[11px] mt-0.5"><strong>Hypothesis:</strong> {exp.hypothesis}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>Metric: {exp.metric}</span>
                      <span className="font-semibold text-emerald-700">Target: {exp.target_threshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State before running AI */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-100 to-teal-100 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Run Idea Intelligence Synthesis</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Click below to have our specialized AI Idea Analysis Agent evaluate your problem, structure customer segments, identify critical assumptions, and suggest a lean MVP feature set.
          </p>
          <button
            onClick={handleRunAIAnalysis}
            disabled={analyzing}
            className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{analyzing ? "Synthesizing..." : "Run AI Analysis Now"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
