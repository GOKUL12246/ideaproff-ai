import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  TrendingUp,
  Sparkles,
  Calculator,
  Save,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const MarketIntelligence: React.FC = () => {
  const { activeIdea } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Bottom-up sizing interactive parameters
  const [targetAccounts, setTargetAccounts] = useState<number>(250000);
  const [annualArpu, setAnnualArpu] = useState<number>(350);
  const [samPercentage, setSamPercentage] = useState<number>(25); // 25% of TAM
  const [somPercentage, setSomPercentage] = useState<number>(5);  // 5% of SAM

  // Dynamic calculations
  const calculatedTam = targetAccounts * annualArpu;
  const calculatedSam = calculatedTam * (samPercentage / 100);
  const calculatedSom = calculatedSam * (somPercentage / 100);

  useEffect(() => {
    if (activeIdea) {
      loadMarketData();
    } else {
      setLoading(false);
    }
  }, [activeIdea?.id]);

  const loadMarketData = async () => {
    if (!activeIdea) return;
    try {
      setLoading(true);
      const res = await api.ideas.get(activeIdea.id);
      if (res.market) {
        setMarketData(res.market.analysis || res.market);
        if (res.market.tam_usd) {
          // Pre-sync if numbers exist
        }
      }
    } catch (e) {
      console.error("Failed to load market data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAIResearch = async () => {
    if (!activeIdea) return;
    try {
      setAnalyzing(true);
      const res = await api.ai.marketResearch(activeIdea.id, {
        tam_usd: calculatedTam,
        sam_usd: calculatedSam,
        som_usd: calculatedSom,
        target_accounts: targetAccounts,
        annual_arpu: annualArpu,
      });
      setMarketData(res.market_research);
      setMessage("Market intelligence and TAM/SAM/SOM model updated!");
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Failed to run market research");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!activeIdea) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <TrendingUp className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Active Startup Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select an active idea from the navbar to view market intelligence.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Market Intelligence & Sizing Module</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Market Research — {activeIdea.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sector: <strong className="text-slate-700">{activeIdea.industry}</strong> • Geography: <strong className="text-slate-700">{activeIdea.target_geography}</strong>
          </p>
        </div>

        <button
          onClick={handleRunAIResearch}
          disabled={analyzing}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{analyzing ? "Synthesizing Sector Trends..." : "Run Market Intelligence Agent"}</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Interactive Bottom-Up TAM / SAM / SOM Calculator */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-teal-600" />
              <span>Interactive Bottom-Up Market Sizing Model</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit assumptions below. Figures dynamically calculate using: <code>Total Target Accounts × Annual ARPU</code>
            </p>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
            Formula: Bottom-Up Account Multiplication
          </span>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Total Target Accounts
            </label>
            <input
              type="number"
              value={targetAccounts}
              onChange={(e) => setTargetAccounts(Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Total addressable customers</p>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Annual ARPU ($)
            </label>
            <input
              type="number"
              value={annualArpu}
              onChange={(e) => setAnnualArpu(Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Annual revenue per customer</p>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              SAM Reachable (%)
            </label>
            <input
              type="number"
              value={samPercentage}
              onChange={(e) => setSamPercentage(Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">% reachable in your geography</p>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              SOM Capture (%)
            </label>
            <input
              type="number"
              value={somPercentage}
              onChange={(e) => setSomPercentage(Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">% captured within 2-3 years</p>
          </div>
        </div>

        {/* 3 Calculated Market Tiers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* TAM */}
          <div className="p-6 rounded-3xl bg-blue-50/40 border border-blue-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Addressable Market (TAM)</span>
              <p className="text-2xl md:text-3xl font-extrabold text-blue-900 mt-2">
                ${calculatedTam.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Total market demand assuming 100% penetration of all {targetAccounts.toLocaleString()} target accounts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-100 text-[11px] text-blue-800 font-semibold">
              Formula: {targetAccounts.toLocaleString()} accounts × ${annualArpu}/yr
            </div>
          </div>

          {/* SAM */}
          <div className="p-6 rounded-3xl bg-teal-50/40 border border-teal-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Serviceable Addressable (SAM)</span>
              <p className="text-2xl md:text-3xl font-extrabold text-teal-900 mt-2">
                ${calculatedSam.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Portion of TAM directly reachable given geographic, language, and distribution constraints ({samPercentage}% of TAM).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-teal-100 text-[11px] text-teal-800 font-semibold">
              Reachable Market in {activeIdea.target_geography || 'Target Region'}
            </div>
          </div>

          {/* SOM */}
          <div className="p-6 rounded-3xl bg-emerald-50/40 border border-emerald-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Serviceable Obtainable (SOM)</span>
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-900 mt-2">
                ${calculatedSom.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Realistic 24-36 month target capturing {somPercentage}% of SAM with initial marketing budget.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100 text-[11px] text-emerald-800 font-semibold">
              Target for Pre-Seed / Seed Milestone
            </div>
          </div>
        </div>

        {/* 3 Scenarios Comparison Table */}
        <div className="pt-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Sizing Scenarios Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-4 rounded-l-lg">Scenario</th>
                  <th className="py-2.5 px-4">Accounts Base</th>
                  <th className="py-2.5 px-4">ARPU</th>
                  <th className="py-2.5 px-4">TAM ($)</th>
                  <th className="py-2.5 px-4">SAM ($)</th>
                  <th className="py-2.5 px-4 rounded-r-lg">SOM ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-600">Conservative (-30%)</td>
                  <td className="py-2.5 px-4">{Math.round(targetAccounts * 0.7).toLocaleString()}</td>
                  <td className="py-2.5 px-4">${Math.round(annualArpu * 0.85)}</td>
                  <td className="py-2.5 px-4">${Math.round(calculatedTam * 0.595).toLocaleString()}</td>
                  <td className="py-2.5 px-4">${Math.round(calculatedSam * 0.595).toLocaleString()}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">${Math.round(calculatedSom * 0.595).toLocaleString()}</td>
                </tr>
                <tr className="bg-blue-50/30">
                  <td className="py-2.5 px-4 font-bold text-blue-700">Base (Your Inputs)</td>
                  <td className="py-2.5 px-4 font-medium">{targetAccounts.toLocaleString()}</td>
                  <td className="py-2.5 px-4 font-medium">${annualArpu}</td>
                  <td className="py-2.5 px-4 font-bold text-blue-900">${calculatedTam.toLocaleString()}</td>
                  <td className="py-2.5 px-4 font-bold text-teal-900">${calculatedSam.toLocaleString()}</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-900">${calculatedSom.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-teal-700">Optimistic (+40%)</td>
                  <td className="py-2.5 px-4">{Math.round(targetAccounts * 1.3).toLocaleString()}</td>
                  <td className="py-2.5 px-4">${Math.round(annualArpu * 1.15)}</td>
                  <td className="py-2.5 px-4">${Math.round(calculatedTam * 1.495).toLocaleString()}</td>
                  <td className="py-2.5 px-4">${Math.round(calculatedSam * 1.495).toLocaleString()}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">${Math.round(calculatedSom * 1.495).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Research Findings & Trends from AI Agent */}
      {marketData && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Industry Macro Overview</h2>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {marketData.industry_overview || "No macro overview generated yet."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Market Trends */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sector Tailwinds & Trends</h3>
              <div className="space-y-2">
                {(marketData.market_trends || []).map((trend: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{trend}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Opportunities */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unserved Market Opportunities</h3>
              <div className="space-y-2">
                {(marketData.market_opportunities || []).map((opp: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-800 flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Source-Linked Findings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source-Linked Findings & Benchmarks</h3>
            <div className="space-y-2">
              {(marketData.source_linked_findings || []).map((item: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.source}:</span>{' '}
                    <span className="text-slate-600">{item.finding}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full flex-shrink-0">
                    {item.verification_status || "Estimate"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
