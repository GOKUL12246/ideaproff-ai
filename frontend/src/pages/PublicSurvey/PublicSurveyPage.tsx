import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { SurveyQuestion } from '../../types';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, Star } from 'lucide-react';

export const PublicSurveyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadPublicSurvey(token);
    }
  }, [token]);

  const loadPublicSurvey = async (surveyToken: string) => {
    try {
      setLoading(true);
      const res = await api.publicSurvey.get(surveyToken);
      setSurvey(res.survey);
    } catch (e: any) {
      setError(e.message || "Survey not found or is currently closed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleChoice = (qId: string, val: string) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleMultipleChoice = (qId: string, val: string) => {
    const current = (answers[qId] as string[]) || [];
    const updated = current.includes(val)
      ? current.filter(x => x !== val)
      : [...current, val];
    setAnswers({ ...answers, [qId]: updated });
  };

  const handleRating = (qId: string, rating: number) => {
    setAnswers({ ...answers, [qId]: rating });
  };

  const handleText = (qId: string, val: string) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Check required fields
    if (survey && survey.questions) {
      for (const q of survey.questions as SurveyQuestion[]) {
        if (q.is_required && (answers[q.id] === undefined || answers[q.id] === '')) {
          alert(`Please answer required question: "${q.question_text}"`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.publicSurvey.submit(token, answers);
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Failed to submit survey. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-xs text-slate-500">
        Loading customer discovery survey...
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-900">Survey Unavailable</h1>
          <p className="text-xs text-slate-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 max-w-md w-full text-center border border-slate-200 shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Thank You!</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your feedback has been recorded securely. Your honest insights directly help founders build better, evidence-backed products.
          </p>
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">Powered by IdeaProof AI — Startup Validation Platform</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm text-left">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              IP
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Startup Feedback Survey</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed">
              {survey.description}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Survey Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {(survey.questions || []).map((q: SurveyQuestion, idx: number) => (
            <div key={q.id || idx} className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Question {idx + 1} {q.is_required && <span className="text-rose-500">*</span>}
                </span>
                <h2 className="text-sm md:text-base font-bold text-slate-900 mt-1">
                  {q.question_text}
                </h2>
              </div>

              {/* Single Choice */}
              {q.question_type === 'single_choice' && (
                <div className="space-y-2">
                  {(q.options || []).map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-center space-x-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        answers[q.id] === opt
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleSingleChoice(q.id, opt)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Multiple Choice */}
              {q.question_type === 'multiple_choice' && (
                <div className="space-y-2">
                  {(q.options || []).map((opt, oIdx) => {
                    const isChecked = ((answers[q.id] as string[]) || []).includes(opt);
                    return (
                      <label
                        key={oIdx}
                        className={`flex items-center space-x-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleMultipleChoice(q.id, opt)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Rating Scale (1 to 5) */}
              {q.question_type === 'rating_scale' && (
                <div className="flex items-center space-x-2 pt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(q.id, star)}
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all ${
                        answers[q.id] === star
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Star className={`w-4 h-4 mb-0.5 ${answers[q.id] === star ? 'fill-white' : 'text-slate-400'}`} />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Short Answer */}
              {q.question_type === 'short_answer' && (
                <input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleText(q.id, e.target.value)}
                  placeholder="Your answer..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              )}

              {/* Long Answer */}
              {q.question_type === 'long_answer' && (
                <textarea
                  rows={3}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleText(q.id, e.target.value)}
                  placeholder="Share details and candid thoughts..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 leading-relaxed"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{submitting ? "Submitting Answers..." : "Submit Survey Answers"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 pb-8">
          Collected with IdeaProof AI. Responses are confidential and strictly for product discovery research.
        </div>
      </div>
    </div>
  );
};
