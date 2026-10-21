import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { 
  Sparkles, 
  ChevronDown, 
  Plus, 
  LogOut, 
  User as UserIcon, 
  Layers, 
  Lightbulb, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, activeIdea, ideas, setActiveIdea, refreshIdeas, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeedDemo = async () => {
    try {
      setSeedingDemo(true);
      const res = await api.ideas.seedDemo();
      setMessage("CampusCart Demo Idea loaded successfully!");
      const updatedIdeas = await refreshIdeas();
      const demoIdea = updatedIdeas.find((i) => i.id === res.demo_data?.idea_id);
      if (demoIdea) {
        setActiveIdea(demoIdea);
      }
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Failed to seed demo idea");
    } finally {
      setSeedingDemo(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Active Idea Dropdown */}
      <div className="flex items-center space-x-4">
        <Link to="/app/dashboard" className="flex items-center space-x-2.5 font-bold text-slate-900 text-lg tracking-tight">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-700 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline">IdeaProof <span className="text-blue-600 font-extrabold">AI</span></span>
        </Link>

        <div className="h-5 w-px bg-slate-200 hidden md:block" />

        {/* Active Idea Picker */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg transition-colors max-w-[200px] md:max-w-[280px]"
          >
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">{activeIdea ? activeIdea.title : "Select Startup Idea"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Your Startup Ideas
              </div>
              <div className="max-h-60 overflow-y-auto">
                {ideas.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => {
                      setActiveIdea(idea);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs md:text-sm hover:bg-slate-50 flex items-center justify-between transition-colors ${
                      activeIdea?.id === idea.id ? 'bg-blue-50/60 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-medium">{idea.title}</p>
                      <p className="text-[11px] text-slate-400">{idea.industry}</p>
                    </div>
                    {idea.is_demo && (
                      <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-1.5 py-0.5 rounded border border-teal-200 flex-shrink-0">
                        Showcase
                      </span>
                    )}
                  </button>
                ))}
                {ideas.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-slate-500">
                    No startup ideas created yet.
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                <Link
                  to="/app/ideas/new"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Startup Idea</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Actions & User Profile */}
      <div className="flex items-center space-x-3">
        {message && (
          <div className="hidden lg:flex items-center space-x-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <button
          onClick={handleSeedDemo}
          disabled={seedingDemo}
          title="Instantly loads CampusCart complete with surveys, competitors, financials, risks and scoring"
          className="flex items-center space-x-1.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{seedingDemo ? "Loading..." : "Load Showcase Startup"}</span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left pr-1">
              <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">{user?.name || user?.email}</p>
              <p className="text-[10px] text-blue-600 font-medium">{user?.role || 'Founder'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                  {user?.role}
                </span>
              </div>
              <Link
                to="/app/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Account & Settings</span>
              </Link>
              <Link
                to="/app/team"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Team Workspace</span>
              </Link>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
