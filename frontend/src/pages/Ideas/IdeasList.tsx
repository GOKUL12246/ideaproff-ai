import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { StartupIdea } from '../../types';
import { 
  Lightbulb, 
  PlusCircle, 
  Search, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  TrendingUp,
  ClipboardCheck,
  Layers
} from 'lucide-react';

export const IdeasList: React.FC = () => {
  const { ideas, activeIdea, setActiveIdea, refreshIdeas } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredIdeas = ideas.filter((idea) =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this startup idea and all its associated surveys, competitors, and reports?")) {
      return;
    }

    try {
      setDeletingId(id);
      await api.ideas.delete(id);
      if (activeIdea?.id === id) {
        setActiveIdea(null);
      }
      await refreshIdeas();
    } catch (e: any) {
      alert(e.message || "Failed to delete idea");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Startup Ideas</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and validate your startup portfolio with AI assistance and empirical evidence.</p>
        </div>
        <Link
          to="/app/ideas/new"
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Idea</span>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title or industry..."
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
        />
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => {
          const isActive = activeIdea?.id === idea.id;
          return (
            <div
              key={idea.id}
              onClick={() => setActiveIdea(idea)}
              className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative ${
                isActive ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {idea.industry}
                  </span>
                  <div className="flex items-center space-x-2">
                    {idea.is_demo && (
                      <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded border border-teal-200">
                        DEMO
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-base font-bold text-slate-900 line-clamp-1">{idea.title}</h2>
                <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {idea.problem_statement || "No problem statement provided."}
                </p>
              </div>

              {/* Stats Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-medium">Surveys</p>
                    <p className="font-bold text-slate-800 mt-0.5">{idea.survey_count ?? 0}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-medium">Competitors</p>
                    <p className="font-bold text-slate-800 mt-0.5">{idea.competitor_count ?? 0}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-medium">Score</p>
                    <p className="font-bold text-blue-600 mt-0.5">
                      {idea.validation_score ? `${idea.validation_score}` : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIdea(idea);
                      navigate(`/app/ideas/${idea.id}/workspace`);
                    }}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, idea.id)}
                    disabled={deletingId === idea.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete startup idea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Lightbulb className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">No startup ideas found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm ? "No startup matches your search filter." : "Create your first idea to begin empirical validation."}
          </p>
          <div className="mt-5">
            <Link
              to="/app/ideas/new"
              className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Idea</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
