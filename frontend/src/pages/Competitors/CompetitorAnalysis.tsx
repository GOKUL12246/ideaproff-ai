import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Competitor } from '../../types';
import {
  Swords,
  PlusCircle,
  Sparkles,
  ExternalLink,
  Trash2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  X
} from 'lucide-react';

export const CompetitorAnalysis: React.FC = () => {
  const { activeIdea } = useAuth();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New competitor form
  const [newComp, setNewComp] = useState({
    name: '',
    website: '',
    product_description: '',
    features: '',
    pricing: '',
    target_customers: '',
    strengths: '',
    weaknesses: '',
    last_verified_date: new Date().toISOString().split('T')[0],
    source_references: 'Direct website & pricing audit'
  });

  useEffect(() => {
    if (activeIdea) {
      loadCompetitors();
    } else {
      setLoading(false);
    }
  }, [activeIdea?.id]);

  const loadCompetitors = async () => {
    if (!activeIdea) return;
    try {
      setLoading(true);
      const res = await api.competitors.list(activeIdea.id);
      setCompetitors(res.competitors || []);
    } catch (e) {
      console.error("Failed to load competitors:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIdea || !newComp.name) return;

    try {
      await api.competitors.create(activeIdea.id, newComp);
      setShowAddModal(false);
      setNewComp({
        name: '',
        website: '',
        product_description: '',
        features: '',
        pricing: '',
        target_customers: '',
        strengths: '',
        weaknesses: '',
        last_verified_date: new Date().toISOString().split('T')[0],
        source_references: 'Direct website audit'
      });
      setMessage("Competitor added to matrix!");
      await loadCompetitors();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to add competitor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this competitor from matrix?")) return;
    try {
      await api.competitors.delete(id);
      await loadCompetitors();
    } catch (e: any) {
      alert(e.message || "Failed to delete competitor");
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!activeIdea) return;
    try {
      setAnalyzing(true);
      const res = await api.ai.competitorAnalysis(activeIdea.id);
      setAiReport(res.competitor_analysis);
      setMessage("Competitive differentiation opportunities synthesized!");
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Failed to run competitor analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!activeIdea) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <Swords className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Active Startup Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select an active idea from the navbar to analyze competitors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-2">
            <Swords className="w-3.5 h-3.5" />
            <span>Competitor Analysis & Differentiation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Competitor Matrix — {activeIdea.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track incumbent alternatives, pricing tiers, feature gaps, and uncover defensible strategic moats.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Competitor</span>
          </button>
          <button
            onClick={handleRunAIAnalysis}
            disabled={analyzing}
            className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-5 py-2.5 rounded-xl shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{analyzing ? "Synthesizing Moats..." : "Run Competitor AI Agent"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Methodology Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 flex items-start space-x-3">
        <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Coverage Notice:</strong> Competitive landscapes are dynamic. The matrix below documents profiled players and does not claim exhaustive discovery. Regularly audit alternatives and customer migration patterns.
        </div>
      </div>

      {/* AI Differentiation Opportunities (Agent D) */}
      {aiReport && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              AI Competitor Intelligence: Moats & White Space
            </h2>
          </div>

          <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
            {aiReport.competitive_landscape_summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Strategic Differentiation Opportunities
              </h3>
              <div className="space-y-2">
                {(aiReport.differentiation_opportunities || []).map((diff: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-amber-100 text-xs text-slate-800 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{diff}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
              <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Unserved White Space Niches
              </h3>
              <div className="space-y-2">
                {(aiReport.white_space_opportunities || []).map((space: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-teal-100 text-xs text-slate-800 flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{space}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            Competitor Comparison Matrix ({competitors.length} Profiled)
          </h2>
          <span className="text-xs text-slate-400">Benchmarked against your UVP</span>
        </div>

        {competitors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 rounded-l-xl">Competitor</th>
                  <th className="py-3 px-4">Pricing Model</th>
                  <th className="py-3 px-4">Core Strengths</th>
                  <th className="py-3 px-4">Key Weaknesses / Moat Gaps</th>
                  <th className="py-3 px-4">Last Verified</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {competitors.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>
                        <p className="font-bold">{comp.name}</p>
                        {comp.website && (
                          <a
                            href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1 mt-0.5"
                          >
                            <span>Visit</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs line-clamp-2">
                          {comp.product_description}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[150px]">
                      <span className="font-medium">{comp.pricing || "N/A"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[200px] leading-relaxed">
                      {comp.strengths || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[220px] leading-relaxed">
                      <span className="text-rose-700 font-medium">{comp.weaknesses || "N/A"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {comp.last_verified_date || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(comp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete competitor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-500">No competitors mapped yet. Click "Add Competitor" above to start benchmarking.</p>
          </div>
        )}
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Competitor to Matrix</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Competitor Name *</label>
                  <input
                    type="text"
                    required
                    value={newComp.name}
                    onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
                    placeholder="e.g. Incumbent App"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={newComp.website}
                    onChange={(e) => setNewComp({ ...newComp, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Description</label>
                <input
                  type="text"
                  value={newComp.product_description}
                  onChange={(e) => setNewComp({ ...newComp, product_description: e.target.value })}
                  placeholder="Summary of their offering"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Tiers</label>
                  <input
                    type="text"
                    value={newComp.pricing}
                    onChange={(e) => setNewComp({ ...newComp, pricing: e.target.value })}
                    placeholder="e.g. Free, $49/mo, Enterprise"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Customers</label>
                  <input
                    type="text"
                    value={newComp.target_customers}
                    onChange={(e) => setNewComp({ ...newComp, target_customers: e.target.value })}
                    placeholder="e.g. Large enterprises, SMBs"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Strengths</label>
                  <textarea
                    rows={2}
                    value={newComp.strengths}
                    onChange={(e) => setNewComp({ ...newComp, strengths: e.target.value })}
                    placeholder="What do they do well?"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Weaknesses & Gaps</label>
                  <textarea
                    rows={2}
                    value={newComp.weaknesses}
                    onChange={(e) => setNewComp({ ...newComp, weaknesses: e.target.value })}
                    placeholder="Where do users complain?"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Save Competitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
