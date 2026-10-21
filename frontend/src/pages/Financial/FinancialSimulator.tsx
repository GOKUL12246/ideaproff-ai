import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Calculator,
  TrendingUp,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export const FinancialSimulator: React.FC = () => {
  const { activeIdea } = useAuth();
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'base' | 'conservative' | 'optimistic'>('base');
  const [simulationData, setSimulationData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Financial input state
  const [inputs, setInputs] = useState({
    initial_investment: 5000,
    development_costs: 3000,
    monthly_opex: 450,
    product_price: 29,
    expected_customers: 60,
    variable_costs: 3,
    marketing_expenses: 600,
    staffing_costs: 1000,
    monthly_growth: 15
  });

  useEffect(() => {
    if (activeIdea) {
      loadFinancials();
    } else {
      setLoading(false);
    }
  }, [activeIdea?.id]);

  const loadFinancials = async () => {
    if (!activeIdea) return;
    try {
      setLoading(true);
      const res = await api.financial.get(activeIdea.id);
      if (res.financials) {
        setInputs({
          initial_investment: res.financials.initial_investment ?? 5000,
          development_costs: res.financials.development_costs ?? 3000,
          monthly_opex: res.financials.monthly_opex ?? 450,
          product_price: res.financials.product_price ?? 29,
          expected_customers: res.financials.expected_customers ?? 60,
          variable_costs: res.financials.variable_costs ?? 3,
          marketing_expenses: res.financials.marketing_expenses ?? 600,
          staffing_costs: res.financials.staffing_costs ?? 1000,
          monthly_growth: res.financials.monthly_growth ?? 15
        });
      }
      if (res.simulation) {
        setSimulationData(res.simulation);
      }
      if (res.ai_analysis) {
        setAiAnalysis(res.ai_analysis);
      }
    } catch (e) {
      console.error("Failed to load financials:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, val: number) => {
    setInputs(prev => ({ ...prev, [field]: val }));
  };

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeIdea) return;
    try {
      setSimulating(true);
      const res = await api.financial.simulate(activeIdea.id, inputs);
      setSimulationData(res.simulation);
      setAiAnalysis(res.ai_analysis);
      setMessage("Financial feasibility simulation recalculated successfully!");
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Failed to run simulation");
    } finally {
      setSimulating(false);
    }
  };

  if (!activeIdea) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <Calculator className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Active Startup Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select an active idea from the navbar to run the financial simulator.</p>
      </div>
    );
  }

  const currentScenario = simulationData ? simulationData[selectedScenario] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Financial Feasibility Simulator</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Unit Economics & 12-Month Projections — {activeIdea.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate cash flow, break-even targets, and burn rate across 3 risk-adjusted scenarios.
          </p>
        </div>

        <button
          onClick={() => handleRunSimulation()}
          disabled={simulating}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{simulating ? "Calculating Models..." : "Run Financial Simulator"}</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Inputs Panel & Controls */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Financial Assumptions & Variables</h2>
            <p className="text-xs text-slate-500">Edit any parameter to recalibrate unit margins and break-even timing.</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Deterministic Python Models</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Initial Investment */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1">Upfront Capex / Investment ($)</label>
            <input
              type="number"
              value={inputs.initial_investment}
              onChange={(e) => handleInputChange('initial_investment', Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Equipment, legal, seed reserve</p>
          </div>

          {/* Development Costs */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1">Development / Prototype ($)</label>
            <input
              type="number"
              value={inputs.development_costs}
              onChange={(e) => handleInputChange('development_costs', Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">MVP build and cloud setup</p>
          </div>

          {/* Product Price */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1">Average Product Price ($) *</label>
            <input
              type="number"
              value={inputs.product_price}
              onChange={(e) => handleInputChange('product_price', Number(e.target.value))}
              className="w-full text-xs font-bold text-blue-700 px-3 py-2 border border-blue-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Subscription or basket size</p>
          </div>

          {/* Variable Cost */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1">Variable Cost per Unit ($)</label>
            <input
              type="number"
              value={inputs.variable_costs}
              onChange={(e) => handleInputChange('variable_costs', Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Hosting, gateway fee, fulfillment</p>
          </div>

          {/* Expected Customers */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Month 1 Customers</label>
            <input
              type="number"
              value={inputs.expected_customers}
              onChange={(e) => handleInputChange('expected_customers', Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Target active accounts</p>
          </div>

          {/* Monthly Growth */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1">Expected Monthly Growth (%)</label>
            <input
              type="number"
              value={inputs.monthly_growth}
              onChange={(e) => handleInputChange('monthly_growth', Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Compounding monthly customer %</p>
          </div>

          {/* Monthly Opex */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1">Fixed Monthly Opex ($)</label>
            <input
              type="number"
              value={inputs.monthly_opex}
              onChange={(e) => handleInputChange('monthly_opex', Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Software tools, rent, servers</p>
          </div>

          {/* Marketing Expenses */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Marketing Spend ($)</label>
            <input
              type="number"
              value={inputs.marketing_expenses}
              onChange={(e) => handleInputChange('marketing_expenses', Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Ad spend, events, campus flyers</p>
          </div>

          {/* Staffing Costs */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Staffing / Stipends ($)</label>
            <input
              type="number"
              value={inputs.staffing_costs}
              onChange={(e) => handleInputChange('staffing_costs', Number(e.target.value))}
              className="w-full text-xs font-bold text-slate-900 px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Founder stipends, interns, student reps</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleRunSimulation()}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Recalculate Projections</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector & Core KPIs */}
      {currentScenario && (
        <div className="space-y-6">
          {/* Scenario Tabs */}
          <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-md">
            <button
              onClick={() => setSelectedScenario('conservative')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedScenario === 'conservative'
                  ? 'bg-amber-100 text-amber-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Conservative
            </button>
            <button
              onClick={() => setSelectedScenario('base')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedScenario === 'base'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Base Plan
            </button>
            <button
              onClick={() => setSelectedScenario('optimistic')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedScenario === 'optimistic'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Optimistic
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Unit Contribution</span>
              <p className="text-2xl md:text-3xl font-extrabold text-blue-600 mt-2">
                ${currentScenario.unit_contribution}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentScenario.contribution_margin_percentage}% margin per sale
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Break-Even Customers</span>
              <p className="text-2xl md:text-3xl font-extrabold text-teal-600 mt-2">
                {currentScenario.break_even_customers > 0 ? `${currentScenario.break_even_customers}` : 'N/A'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Accounts to cover fixed costs</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Break-Even Timing</span>
              <p className="text-2xl md:text-3xl font-extrabold text-indigo-600 mt-2">
                {typeof currentScenario.estimated_break_even_month === 'number'
                  ? `Month ${currentScenario.estimated_break_even_month}`
                  : currentScenario.estimated_break_even_month}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Offsetting upfront capital</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Year 1 Net Result</span>
              <p className={`text-2xl md:text-3xl font-extrabold mt-2 ${
                currentScenario.year_net_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                ${currentScenario.year_net_profit.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                On ${currentScenario.year_total_revenue.toLocaleString()} revenue
              </p>
            </div>
          </div>

          {/* 12-Month Projections Chart (Recharts) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  12-Month Revenue vs. Expenses vs. Cash Flow ({selectedScenario.toUpperCase()} SCENARIO)
                </h3>
                <p className="text-xs text-slate-500">Compounding projection based on monthly growth and operating costs.</p>
              </div>
              <span className="text-[10px] text-slate-400 italic">Values in USD ($)</span>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentScenario.monthly_projections} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickFormatter={(val) => `$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                    labelFormatter={(label) => `Month ${label}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="revenue" name="Monthly Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="total_expenses" name="Total Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                  <Area type="monotone" dataKey="cumulative_cash_flow" name="Cumulative Cash" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Financial Agent Explanation (Agent E) */}
          {aiAnalysis && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  AI Financial Analysis Agent Insights
                </h2>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                <p><strong>Executive Assessment:</strong> {aiAnalysis.financial_executive_summary}</p>
                <p><strong>Burn Rate & Runway:</strong> {aiAnalysis.burn_rate_and_runway_assessment}</p>
                <p><strong>Unit Economics Health:</strong> {aiAnalysis.unit_economics_health}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                  <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Key Financial Risks</span>
                  </h3>
                  <div className="space-y-2">
                    {(aiAnalysis.financial_risks || []).map((risk: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-rose-100 text-xs text-slate-800">
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                  <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                    <span>Margin Optimization Recommendations</span>
                  </h3>
                  <div className="space-y-2">
                    {(aiAnalysis.improvement_recommendations || []).map((rec: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-teal-100 text-xs text-slate-800">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
