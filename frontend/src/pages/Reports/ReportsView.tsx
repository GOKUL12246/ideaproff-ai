import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ReportItem } from '../../types';
import {
  FileText,
  Download,
  Sparkles,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { activeIdea } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeIdea) {
      loadReports();
    } else {
      setLoading(false);
    }
  }, [activeIdea?.id]);

  const loadReports = async () => {
    if (!activeIdea) return;
    try {
      setLoading(true);
      const res = await api.reports.list(activeIdea.id);
      const list = res.reports || [];
      setReports(list);
      if (list.length > 0 && !selectedReport) {
        setSelectedReport(list[0]);
      }
    } catch (e) {
      console.error("Failed to load reports:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewReport = async () => {
    if (!activeIdea) return;
    try {
      setGenerating(true);
      const res = await api.reports.create(activeIdea.id);
      setMessage("Comprehensive validation report compiled!");
      await loadReports();
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = (reportId: string) => {
    const token = localStorage.getItem('ideaproof_token');
    const url = api.reports.downloadPdfUrl(reportId);

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
        a.download = `IdeaProof_Validation_Report_${activeIdea?.title?.replace(/\s+/g, '_') || 'Dossier'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => alert("PDF download failed: " + err.message));
  };

  if (!activeIdea) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Active Startup Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select an active idea from the navbar to view or generate validation reports.</p>
      </div>
    );
  }

  const reportData = selectedReport?.report_data || {};
  const score = reportData.validation_score || {};
  const coverage = score.evidence_coverage || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Validation Dossier Generator</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Validation Reports — {activeIdea.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Export audit-ready PDF diligence packages and view comprehensive multi-agent validation synthesis.
          </p>
        </div>

        <button
          onClick={handleGenerateNewReport}
          disabled={generating}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? "Compiling Full Dossier..." : "Generate New Dossier"}</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Reports History Tabs */}
      {reports.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {reports.map((rep) => (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedReport?.id === rep.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{new Date(rep.created_at).toLocaleDateString()} — {rep.title}</span>
            </button>
          ))}
        </div>
      )}

      {selectedReport ? (
        <div className="space-y-6">
          {/* Action Banner with Download Button */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">ReportLab PDF Export</span>
              <h2 className="text-xl font-bold mt-1">{selectedReport.title}</h2>
              <p className="text-xs text-slate-400 mt-1">Generated {new Date(selectedReport.created_at).toLocaleString()}</p>
            </div>

            <button
              onClick={() => handleDownloadPdf(selectedReport.id)}
              className="inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Dossier</span>
            </button>
          </div>

          {/* 13 Required Report Sections Preview */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700">
            {/* 1. Executive Summary */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                1. Executive Summary
              </h2>
              <p className="leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {reportData.executive_summary || "Executive summary synthesis."}
              </p>
            </div>

            {/* 2. Problem & Proposed Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Problem Statement:</span>
                <p>{activeIdea.problem_statement}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Proposed Solution:</span>
                <p>{activeIdea.proposed_solution}</p>
              </div>
            </div>

            {/* 8. Validation Score & Evidence Coverage */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                8. Deterministic Validation Readiness Score
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Overall Score</span>
                  <p className="text-3xl font-black text-blue-900 mt-1">{score.overall_score || 0} / 100</p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-blue-700">{score.recommendation_band}</span>
                </div>
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 text-center">
                  <span className="text-[10px] font-bold text-teal-700 uppercase">Evidence Coverage</span>
                  <p className="text-3xl font-black text-teal-900 mt-1">{coverage.coverage_percentage || 0}%</p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-teal-700">Confidence: {coverage.confidence_level}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Primary Evidence</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">Verified with real survey responses & competitors</p>
                </div>
              </div>
            </div>

            {/* 10. Risk Analysis & 11. Missing Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-1.5">
                <span className="font-bold text-emerald-900 block">Supporting Evidence (Verified):</span>
                {(score.supporting_evidence || []).map((s: string, i: number) => (
                  <p key={i} className="text-[11px] text-emerald-800">• {s}</p>
                ))}
              </div>
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-1.5">
                <span className="font-bold text-rose-900 block">Critical Missing Evidence (Gaps):</span>
                {(score.missing_evidence || []).map((m: string, i: number) => (
                  <p key={i} className="text-[11px] text-rose-800">• {m}</p>
                ))}
              </div>
            </div>

            {/* 12. MVP Recommendations & 13. Roadmap */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                12. MVP Recommendations & 13. Startup Roadmap
              </h2>
              <div className="space-y-2">
                {(reportData.roadmap_tasks || []).slice(0, 4).map((task: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{task.title}</span>
                      <p className="text-slate-500 text-[11px]">{task.timeframe} • Owner: {task.assigned_user}</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {task.priority} Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No Validation Reports Generated Yet</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Click "Generate New Dossier" above to orchestrate all specialized AI agents and compile a downloadable ReportLab PDF.
          </p>
        </div>
      )}
    </div>
  );
};
