import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Survey, SurveyQuestion, QuestionType } from '../../types';
import {
  ClipboardCheck,
  PlusCircle,
  Sparkles,
  Link as LinkIcon,
  BarChart2,
  CheckCircle2,
  Copy,
  Trash2,
  ExternalLink,
  HelpCircle,
  Eye,
  AlertCircle
} from 'lucide-react';

export const SurveyList: React.FC = () => {
  const { activeIdea } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // New survey state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    {
      id: 'q1',
      question_text: 'How often do you personally face this issue?',
      question_type: 'single_choice',
      is_required: true,
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely or Never']
    },
    {
      id: 'q2',
      question_text: 'What is your biggest frustration with existing workarounds?',
      question_type: 'long_answer',
      is_required: true
    },
    {
      id: 'q3',
      question_text: 'On a scale of 1 to 5, how urgent is solving this problem for you?',
      question_type: 'rating_scale',
      is_required: true,
      scale_min: 1,
      scale_max: 5
    }
  ]);

  useEffect(() => {
    if (activeIdea) {
      loadSurveys();
    } else {
      setLoading(false);
    }
  }, [activeIdea?.id]);

  const loadSurveys = async () => {
    if (!activeIdea) return;
    try {
      setLoading(true);
      const res = await api.surveys.list(activeIdea.id);
      setSurveys(res.surveys || []);
    } catch (e) {
      console.error("Failed to load surveys:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/public/surveys/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const handleGenerateAIQuestions = async () => {
    if (!activeIdea) return;
    try {
      setGeneratingAI(true);
      const res = await api.surveys.generateQuestions({
        title: activeIdea.title,
        problem_statement: activeIdea.problem_statement,
        target_customers: activeIdea.target_customers
      });
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
      }
    } catch (e: any) {
      alert(e.message || "Failed to generate AI questions");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAddQuestion = () => {
    const newQ: SurveyQuestion = {
      id: `q_${Date.now()}`,
      question_text: '',
      question_type: 'single_choice',
      is_required: true,
      options: ['Option 1', 'Option 2', 'Option 3']
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof SurveyQuestion, val: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: val };
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    const opts = [...(updated[qIdx].options || [])];
    opts[optIdx] = val;
    updated[qIdx].options = opts;
    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions];
    const opts = [...(updated[qIdx].options || []), `Option ${(updated[qIdx].options?.length || 0) + 1}`];
    updated[qIdx].options = opts;
    setQuestions(updated);
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIdea) return;
    if (!title) {
      alert("Please enter a survey title");
      return;
    }
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    try {
      await api.surveys.create(activeIdea.id, {
        title,
        description,
        questions,
        status: 'published'
      });
      setShowBuilder(false);
      setTitle('');
      setDescription('');
      await loadSurveys();
    } catch (e: any) {
      alert(e.message || "Failed to create survey");
    }
  };

  const handleToggleStatus = async (survey: Survey) => {
    const newStatus = survey.status === 'published' ? 'closed' : 'published';
    try {
      await api.surveys.update(survey.id, { status: newStatus });
      await loadSurveys();
    } catch (e: any) {
      alert(e.message || "Failed to update status");
    }
  };

  if (!activeIdea) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <ClipboardCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Active Startup Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select an active idea from the navbar to view or create surveys.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Customer Validation Module</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Discovery Surveys — {activeIdea.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build unbiased surveys, collect primary customer evidence, and analyze real responses with Recharts.
          </p>
        </div>

        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showBuilder ? "Hide Survey Builder" : "Create New Survey"}</span>
        </button>
      </div>

      {/* Survey Builder Modal / Drawer */}
      {showBuilder && (
        <form onSubmit={handleCreateSurvey} className="bg-white rounded-3xl p-6 md:p-8 border-2 border-indigo-200 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Survey Builder</h2>
              <p className="text-xs text-slate-500">Formulate neutral questions to uncover true willingness to pay and pain frequency.</p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAIQuestions}
              disabled={generatingAI}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{generatingAI ? "Generating Questions..." : "Generate Unbiased AI Questions"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Survey Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Student Resale & Dorm Essentials Survey"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Description / Brief</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 2-minute feedback on campus marketplace frustrations"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Question List Builder */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Questions ({questions.length})</span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Question #{idx + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={q.question_text}
                      onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                      required
                      placeholder="Enter question text..."
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <select
                      value={q.question_type}
                      onChange={(e) => handleQuestionChange(idx, 'question_type', e.target.value as QuestionType)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="single_choice">Single Choice (Radio)</option>
                      <option value="multiple_choice">Multiple Choice (Checkboxes)</option>
                      <option value="rating_scale">Rating Scale (1 to 5)</option>
                      <option value="short_answer">Short Answer (Text)</option>
                      <option value="long_answer">Long Answer (Textarea)</option>
                    </select>
                  </div>
                </div>

                {/* Options if Choice */}
                {(q.question_type === 'single_choice' || q.question_type === 'multiple_choice') && (
                  <div className="space-y-1.5 pl-2 pt-1 border-l-2 border-indigo-200">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Answer Options:</p>
                    {(q.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                          className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white flex-1 max-w-sm"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddOption(idx)}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline pt-1"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowBuilder(false)}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-bold px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
            >
              Save & Publish Survey
            </button>
          </div>
        </form>
      )}

      {/* Surveys List */}
      <div className="space-y-4">
        {surveys.map((survey) => (
          <div
            key={survey.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  survey.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {survey.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">Token: <code className="font-mono text-slate-600">{survey.token}</code></span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{survey.title}</h2>
              <p className="text-xs text-slate-500">{survey.description || "No description specified."}</p>
              <div className="flex items-center space-x-4 text-xs text-slate-600 pt-1">
                <span><strong>{survey.questions.length}</strong> questions</span>
                <span>•</span>
                <span><strong>{survey.response_count ?? 0}</strong> verified responses</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Shareable Link Button */}
              <button
                onClick={() => handleCopyLink(survey.token)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                title="Copy public respondent URL"
              >
                {copiedToken === survey.token ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Share Link</span>
                  </>
                )}
              </button>

              {/* Public View link */}
              <a
                href={`/public/surveys/${survey.token}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Preview</span>
              </a>

              {/* Toggle Status */}
              <button
                onClick={() => handleToggleStatus(survey)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {survey.status === 'published' ? 'Close Survey' : 'Re-open Survey'}
              </button>

              {/* View Analytics */}
              <Link
                to={`/app/surveys/${survey.id}/analytics`}
                className="inline-flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>View Analytics</span>
              </Link>
            </div>
          </div>
        ))}

        {surveys.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-800">No customer surveys created yet</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start gathering primary evidence directly from target users to validate your assumptions.
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              className="mt-5 inline-flex items-center space-x-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Survey</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
