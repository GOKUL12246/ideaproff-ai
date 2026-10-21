import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart2,
  Download,
  ArrowLeft,
  CheckCircle2,
  Users,
  Flame,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

const COLORS = ['#2563eb', '#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

export const SurveyAnalyticsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAnalytics(id);
    }
  }, [id]);

  const loadAnalytics = async (surveyId: string) => {
    try {
      setLoading(true);
      const res = await api.surveys.getAnalytics(surveyId);
      setData(res);
    } catch (e) {
      console.error("Failed to load survey analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!id) return;
    const token = localStorage.getItem('ideaproof_token');
    const url = api.surveys.getExportCsvUrl(id);
    
    // Trigger direct download
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `survey_${id}_responses.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => alert("CSV export failed: " + err.message));
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-500">Loading survey analytics...</div>;
  }

  if (!data) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Survey Analytics Unavailable</h2>
        <Link to="/app/surveys" className="mt-4 inline-block text-xs font-semibold text-blue-600">
          Back to Surveys
        </Link>
      </div>
    );
  }

  const aiInsights = data.ai_insights || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/app/surveys"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Live Customer Analytics</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                Sample: n={data.total_responses}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {data.survey_title}
            </h1>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Responses (CSV)</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Responses</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{data.total_responses}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified customer submissions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Completion Rate</span>
          <p className="text-3xl font-extrabold text-teal-600 mt-2">{data.completion_rate}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Submitted all questions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Average Rating</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">
            {data.average_rating ? `${data.average_rating} / 5` : 'N/A'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across rating scale questions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Confidence Band</span>
          <p className="text-xl font-bold text-slate-800 mt-2">
            {data.total_responses >= 20 ? 'Statistically Relevant' : (data.total_responses >= 5 ? 'Early Qualitative Signal' : 'Preliminary (Under 5)')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sample size limitation status</p>
        </div>
      </div>

      {/* AI Customer Validation Agent Synthesis */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Customer Validation Agent Synthesis (From Real Responses)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pain Points */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Primary Pain Points Identified</span>
            </h3>
            <div className="space-y-2">
              {(aiInsights.primary_pain_points || []).map((p: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                  <p className="font-semibold text-slate-900">{p.pain_point}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.user_verbatim_summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Willingness to Pay & Objections */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Willingness To Pay & Customer Objections
            </h3>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong>Price Elasticity:</strong> {aiInsights.willingness_to_pay_insights || "No pricing data collected."}
            </div>
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-slate-600 uppercase">Top Objections:</p>
              {(aiInsights.customer_objections || []).map((obj: string, idx: number) => (
                <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Question Level Charts (Recharts) */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-slate-900">Question-Level Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(data.question_analytics || []).map((q: any) => (
            <div key={q.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{q.question_type.replace('_', ' ')}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{q.question_text}</h3>
              </div>

              {/* Render Chart if Choice or Rating */}
              {q.distribution && q.distribution.length > 0 ? (
                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={q.distribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey={q.question_type === 'rating_scale' ? 'rating' : 'name'}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : q.text_responses && q.text_responses.length > 0 ? (
                /* Text Responses List */
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {q.text_responses.map((txt: string, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed italic">
                      "{txt}"
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">No responses yet for this question.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
