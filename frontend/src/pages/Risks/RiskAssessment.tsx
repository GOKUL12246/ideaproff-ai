import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { RiskItem } from '../../types';
import {
  AlertTriangle,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  X,
  Filter,
  UserCheck
} from 'lucide-react';

export const RiskAssessment: React.FC = () => {
  const { activeIdea } = useAuth();
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [message, setMessage] = useState<string | null>(null);

  const [newRisk, setNewRisk] = useState<RiskItem>({
    category: 'Market demand',
    description: '',
    likelihood: 'Medium',
    impact: 'High',
    severity: 'High',
    supporting_evidence: '',
    mitigation_plan: '',
    assigned_owner: 'Founding Team',
    status: 'Active'
  });

  const categories = [
    'Market demand',
    'Customer adoption',
    'Competition',
    'Technical feasibility',
    'Financial sustainability',
    'Operational execution',
    'Data privacy',
    'Legal & regulatory'
  ];

  useEffect(() => {
    if (activeIdea) {
      loadRisks();
    } else {
      setLoading(false);
    }
  }, [activeIdea?.id]);

  const loadRisks = async () => {
    if (!activeIdea) return;
    try {
      setLoading(true);
      const res = await api.risks.list(activeIdea.id);
      setRisks(res.risks || []);
    } catch (e) {
      console.error("Failed to load risks:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIdea || !newRisk.description) return;
    try {
      await api.risks.create(activeIdea.id, newRisk);
      setShowAddModal(false);
      setNewRisk({
        category: 'Market demand',
        description: '',
        likelihood: 'Medium',
        impact: 'High',
        severity: 'High',
        supporting_evidence: '',
        mitigation_plan: '',
        assigned_owner: 'Founding Team',
        status: 'Active'
      });
      setMessage("Risk item logged into registry!");
      await loadRisks();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to add risk");
    }
  };

  const handleStatusChange = async (riskId: string, newStatus: any) => {
    try {
      await api.risks.update(riskId, { status: newStatus });
      await loadRisks();
    } catch (e: any) {
      alert(e.message || "Failed to update risk status");
    }
  };

  const handleDelete = async (riskId: string) => {
    if (!window.confirm("Remove this risk from registry?")) return;
    try {
      await api.risks.delete(riskId);
      await loadRisks();
    } catch (e: any) {
      alert(e.message || "Failed to delete risk");
    }
  };

  if (!activeIdea) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Active Startup Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select an active idea from the navbar to manage risks.</p>
      </div>
    );
  }

  const filteredRisks = filterCategory === 'All'
    ? risks
    : risks.filter(r => r.category === filterCategory);

  // Group risks for 3x3 Heatmap Matrix
  const getMatrixCell = (likelihood: string, impact: string) => {
    return risks.filter(r => r.likelihood === likelihood && r.impact === impact);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Risk Management & Mitigation Dashboard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Risk Assessment — {activeIdea.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track likelihood, impact, assigned owners, and mitigation actions across 8 operational categories.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-5 py-2.5 rounded-xl shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Risk</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* 3x3 Likelihood vs Impact Matrix */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Risk Severity Matrix (Likelihood vs. Impact)</h2>
            <p className="text-xs text-slate-500">Visual mapping of venture failure modes and vulnerability clusters.</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">3 × 3 Heatmap</span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2 text-xs">
          {/* Header column */}
          <div className="font-bold text-slate-400 p-2 text-center flex items-center justify-center">
            Likelihood \ Impact
          </div>
          <div className="font-bold text-slate-700 p-2 text-center bg-slate-50 rounded-lg">Low Impact</div>
          <div className="font-bold text-slate-700 p-2 text-center bg-slate-50 rounded-lg">Medium Impact</div>
          <div className="font-bold text-slate-700 p-2 text-center bg-slate-50 rounded-lg">High Impact</div>

          {/* High Likelihood Row */}
          <div className="font-bold text-slate-700 p-2 flex items-center justify-center bg-slate-50 rounded-lg">
            High
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 min-h-[70px]">
            <p className="text-[10px] font-bold text-amber-700 mb-1">Medium Severity</p>
            {getMatrixCell('High', 'Low').map((r, i) => (
              <span key={i} className="inline-block bg-white text-slate-800 text-[10px] px-1.5 py-0.5 rounded mr-1 mb-1 border border-amber-200 shadow-2xs truncate max-w-[120px]">
                {r.category}
              </span>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 min-h-[70px]">
            <p className="text-[10px] font-bold text-rose-700 mb-1">High Severity</p>
            {getMatrixCell('High', 'Medium').map((r, i) => (
              <span key={i} className="inline-block bg-white text-slate-800 text-[10px] px-1.5 py-0.5 rounded mr-1 mb-1 border border-rose-200 shadow-2xs truncate max-w-[120px]">
                {r.category}
              </span>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 min-h-[70px]">
            <p className="text-[10px] font-bold text-rose-900 mb-1">Critical Severity</p>
            {getMatrixCell('High', 'High').map((r, i) => (
              <span key={i} className="inline-block bg-white text-rose-900 font-semibold text-[10px] px-1.5 py-0.5 rounded mr-1 mb-1 border border-rose-300 shadow-2xs truncate max-w-[120px]">
                {r.category}
              </span>
            ))}
          </div>

          {/* Medium Likelihood Row */}
          <div className="font-bold text-slate-700 p-2 flex items-center justify-center bg-slate-50 rounded-lg">
            Medium
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 min-h-[70px]">
            <p className="text-[10px] font-bold text-emerald-700 mb-1">Low Severity</p>
            {getMatrixCell('Medium', 'Low').map((r, i) => (
              <span key={i} className="inline-block bg-white text-slate-800 text-[10px] px-1.5 py-0.5 rounded mr-1 mb-1 border border-emerald-200 shadow-2xs truncate max-w-[120px]">
                {r.category}
              </span>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 min-h-[70px]">
            <p className="text-[10px] font-bold text-amber-700 mb-1">Medium Severity</p>
            {getMatrixCell('Medium', 'Medium').map((r, i) => (
              <span key={i} className="inline-block bg-white text-slate-800 text-[10px] px-1.5 py-0.5 rounded mr-1 mb-1 border border-amber-200 shadow-2xs truncate max-w-[120px]">
                {r.category}
              </span>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 min-h-[70px]">
            <p className="text-[10px] font-bold text-rose-700 mb-1">High Severity</p>
            {getMatrixCell('Medium', 'High').map((r, i) => (
              <span key={i} className="inline-block bg-white text-slate-800 text-[10px] px-1.5 py-0.5 rounded mr-1 mb-1 border border-rose-200 shadow-2xs truncate max-w-[120px]">
                {r.category}
              </span>
            ))}
          </div>

          {/* Low Likelihood Row */}
          <div className="font-bold text-slate-700 p-2 flex items-center justify-center bg-slate-50 rounded-lg">
            Low
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 min-h-[70px]">
            <p className="text-[10px] font-bold text-slate-500 mb-1">Low Severity</p>
            {getMatrixCell('Low', 'Low').map((r, i) => (
              <span key={i} className="inline-block bg-white text-slate-800 text-[10px] px-1.5 py-0.5 rounded mr-1 mb-1 border border-slate-200 shadow-2xs truncate max-w-[120px]">
                {r.category}
              </span>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 min-h-[70px]">
            <p className="text-[10px] font-bold text-emerald-700 mb-1">Low Severity</p>
            {getMatrixCell('Low', 'Medium').map((r, i) => (
              <span key={i} className="inline-block bg-white text-slate-800 text-[10px] px-1.5 py-0.5 rounded mr-1 mb-1 border border-emerald-200 shadow-2xs truncate max-w-[120px]">
                {r.category}
              </span>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 min-h-[70px]">
            <p className="text-[10px] font-bold text-amber-700 mb-1">Medium Severity</p>
            {getMatrixCell('Low', 'High').map((r, i) => (
              <span key={i} className="inline-block bg-white text-slate-800 text-[10px] px-1.5 py-0.5 rounded mr-1 mb-1 border border-amber-200 shadow-2xs truncate max-w-[120px]">
                {r.category}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Risks Registry List */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            Registered Risks & Mitigation Plans ({filteredRisks.length})
          </h2>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredRisks.map((risk, idx) => (
            <div
              key={risk.id || idx}
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 hover:bg-white transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {risk.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    risk.severity === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    (risk.severity === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200')
                  }`}>
                    {risk.severity} Severity
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={risk.status}
                    onChange={(e) => risk.id && handleStatusChange(risk.id, e.target.value)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Monitoring">Monitoring</option>
                  </select>

                  {risk.id && (
                    <button
                      onClick={() => handleDelete(risk.id!)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs font-bold text-slate-900 leading-snug">
                {risk.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Supporting Evidence:</span>
                  <p className="text-slate-600 mt-0.5">{risk.supporting_evidence || "None provided."}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase">Mitigation Plan:</span>
                  <p className="text-slate-800 mt-0.5 font-medium">{risk.mitigation_plan || "No mitigation plan documented."}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Likelihood: <strong className="text-slate-700">{risk.likelihood}</strong> | Impact: <strong className="text-slate-700">{risk.impact}</strong></span>
                <span>Assigned Owner: <strong className="text-slate-700">{risk.assigned_owner}</strong></span>
              </div>
            </div>
          ))}

          {filteredRisks.length === 0 && (
            <p className="text-xs text-slate-400 py-8 text-center">No risks found for this category.</p>
          )}
        </div>
      </div>

      {/* Add Risk Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Risk Item</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRisk} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Risk Category</label>
                <select
                  value={newRisk.category}
                  onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Risk Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                  placeholder="Detail the failure condition or vulnerability..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Likelihood</label>
                  <select
                    value={newRisk.likelihood}
                    onChange={(e) => setNewRisk({ ...newRisk, likelihood: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Impact</label>
                  <select
                    value={newRisk.impact}
                    onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
                  <select
                    value={newRisk.severity}
                    onChange={(e) => setNewRisk({ ...newRisk, severity: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supporting Evidence</label>
                <input
                  type="text"
                  value={newRisk.supporting_evidence}
                  onChange={(e) => setNewRisk({ ...newRisk, supporting_evidence: e.target.value })}
                  placeholder="e.g. 40% of surveyed users reported switching friction"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mitigation Action Plan</label>
                <textarea
                  rows={2}
                  value={newRisk.mitigation_plan}
                  onChange={(e) => setNewRisk({ ...newRisk, mitigation_plan: e.target.value })}
                  placeholder="How will your team eliminate or reduce this risk?"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Owner</label>
                <input
                  type="text"
                  value={newRisk.assigned_owner}
                  onChange={(e) => setNewRisk({ ...newRisk, assigned_owner: e.target.value })}
                  placeholder="e.g. Founder, Technical Lead"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Save Risk Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
