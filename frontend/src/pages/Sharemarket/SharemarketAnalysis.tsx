import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { SharemarketAnalysis, PublicCompTicker } from '../../types';
import {
  TrendingUp,
  RefreshCw,
  Landmark,
  DollarSign,
  AlertCircle,
  Building2,
  ExternalLink,
  Target,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export const SharemarketAnalysisView: React.FC = () => {
  const { activeIdea } = useAuth();
  const [data, setData] = useState<SharemarketAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeIdea?.id) {
      loadSharemarketData(activeIdea.id);
    }
  }, [activeIdea?.id]);

  const loadSharemarketData = async (ideaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.ai.sharemarketAnalysis(ideaId);
      setData(res.sharemarket_analysis);
    } catch (err: any) {
      setError(err?.message || 'Failed to load public market data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!activeIdea?.id) return;
    setRefreshing(true);
    setError(null);
    try {
      const res = await api.ai.refreshSharemarketAnalysis(activeIdea.id);
      setData(res.sharemarket_analysis);
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh public market data with Gemini AI.');
    } finally {
      setRefreshing(false);
    }
  };

  if (!activeIdea) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Landmark className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">No Active Startup Idea Selected</h2>
        <p className="text-sm text-slate-500 mb-6">
          Select or create a startup idea from your dashboard to view public sharemarket comps, valuation multiples, and IPO benchmarks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Public Equity Intelligence
            </span>
            {data?.is_live_ai && (
              <span className="flex items-center space-x-1 text-xs text-blue-600 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini Analyzed</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Sharemarket & Public Comps Analysis</h1>
          <p className="text-sm text-slate-500">
            Evaluating <strong className="text-slate-800">{activeIdea.title}</strong> against publicly traded equities, valuation multiples, and stock market exit benchmarks.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          {refreshing ? 'Analyzing Equities...' : 'Refresh Live Comps'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Analysis Notice</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-sm font-medium text-slate-600">Gathering public equity data and stock comps...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>SECTOR SENTIMENT</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2.5 py-1 rounded-md text-sm font-bold ${
                  data.market_sentiment === 'Bullish' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : data.market_sentiment === 'Neutral'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {data.market_sentiment}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 truncate" title={data.sector_name}>
                {data.sector_name}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>MEDIAN EV / REVENUE</span>
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">
                {data.median_ev_revenue_multiple}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Public peer revenue multiple range
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>MEDIAN P/E RATIO</span>
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">
                {data.median_pe_multiple}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Earnings multiple for profitable comps
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>GROSS MARGIN HURDLE</span>
                <PieChart className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">
                {data.public_gross_margin_benchmark}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Public market gross margin threshold
              </p>
            </div>
          </div>

          {/* Sentiment Rationale Banner */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Public Stock Market Sector Sentiment</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  {data.sentiment_rationale}
                </p>
                <div className="mt-3 flex items-center space-x-4 text-xs text-slate-400">
                  <span>Rule of 40 Target: <strong className="text-teal-400">{data.rule_of_40_target}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Public Comparable Tickers Grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Publicly Traded Comparable Companies</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Benchmarks from NASDAQ, NYSE, and global stock exchanges operating in comparable customer segments.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {data.public_comps?.length || 0} Listed Tickers
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {data.public_comps?.map((comp, idx) => (
                <div key={idx} className="p-5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold tracking-wide">
                          {comp.ticker}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{comp.company_name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {comp.exchange}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed pt-1">
                        {comp.relevance_to_startup}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 flex-shrink-0 text-right">
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase font-semibold">Market Cap</div>
                        <div className="text-sm font-bold text-slate-900">{comp.market_cap}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase font-semibold">EV / Revenue</div>
                        <div className="text-sm font-bold text-blue-600">{comp.ev_revenue}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase font-semibold">P/E Ratio</div>
                        <div className="text-sm font-bold text-purple-600">{comp.pe_ratio}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase font-semibold">Annual Sales</div>
                        <div className="text-sm font-bold text-slate-800">{comp.annual_revenue}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Column Section: IPO Readiness & Strategic M&A */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* IPO Readiness Benchmark */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <Target className="w-5 h-5 text-blue-600" />
                <h3>Public Market IPO Readiness Benchmark</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Minimum Scale for IPO:</span>
                  <span className="text-xs font-bold text-slate-900">{data.ipo_readiness_benchmark?.min_arr_required}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Gross Margin Hurdle:</span>
                  <span className="text-xs font-bold text-emerald-700">{data.ipo_readiness_benchmark?.gross_margin_hurdle}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Rule of 40 Efficiency:</span>
                  <span className="text-xs font-bold text-blue-700">{data.ipo_readiness_benchmark?.rule_of_40_target}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Average Time to IPO:</span>
                  <span className="text-xs font-bold text-purple-700">{data.ipo_readiness_benchmark?.average_time_to_ipo}</span>
                </div>
              </div>
            </div>

            {/* Strategic Public M&A Acquirers */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3>Potential Strategic Public Acquirers (M&A)</h3>
              </div>

              <div className="space-y-3">
                {data.ma_exit_opportunities?.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <div className="font-semibold text-slate-900 text-sm flex items-center justify-between">
                      <span>{item.acquirer_name}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-600">{item.strategic_rationale}</p>
                    {item.recent_deal_example && (
                      <p className="text-[11px] text-slate-400 italic pt-1">
                        Precedent: {item.recent_deal_example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Public Market Risks */}
          {data.public_market_risks && data.public_market_risks.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm mb-3">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h4>Public Market Macro & Multiple Compression Risks</h4>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-950">
                {data.public_market_risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">&bull;</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
