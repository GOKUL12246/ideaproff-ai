import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Lightbulb,
  PlusCircle,
  TrendingUp,
  ClipboardCheck,
  Swords,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Milestone,
  FileText,
  Users,
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeIdea } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'My Startup Ideas', path: '/app/ideas', icon: Lightbulb },
    { label: 'Create New Idea', path: '/app/ideas/new', icon: PlusCircle },
    { type: 'header', label: 'VALIDATION MODULES' },
    { label: 'AI Idea Intelligence', path: `/app/ideas/${activeIdea?.id || 'select'}/workspace`, icon: Sparkles, requiresIdea: true },
    { label: 'Market Intelligence', path: '/app/market', icon: TrendingUp, requiresIdea: true },
    { label: 'Customer Surveys', path: '/app/surveys', icon: ClipboardCheck, requiresIdea: true },
    { label: 'Competitor Analysis', path: '/app/competitors', icon: Swords, requiresIdea: true },
    { label: 'Financial Simulator', path: '/app/financial', icon: Calculator, requiresIdea: true },
    { label: 'AI Validation', path: '/app/validation', icon: ShieldCheck, requiresIdea: true },
    { label: 'Risk Assessment', path: '/app/risks', icon: AlertTriangle, requiresIdea: true },
    { label: 'Startup Roadmap', path: '/app/roadmap', icon: Milestone, requiresIdea: true },
    { label: 'Reports', path: '/app/reports', icon: FileText, requiresIdea: true },
    { type: 'header', label: 'ORGANIZATION' },
    { label: 'Team Workspace', path: '/app/team', icon: Users },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const content = (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 flex-shrink-0">
      {/* Brand logo in sidebar for mobile/desktop */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            IP
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight leading-none">IdeaProof AI</h1>
            <p className="text-[11px] text-teal-400 font-medium mt-0.5">Startup Validation</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item, idx) => {
          if (item.type === 'header') {
            return (
              <div key={idx} className="pt-4 pb-1.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {item.label}
              </div>
            );
          }

          const Icon = item.icon!;
          const isDisabled = item.requiresIdea && !activeIdea;

          return (
            <NavLink
              key={item.path}
              to={isDisabled ? '#' : item.path!}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  alert('Please select or create a startup idea first to access this module.');
                } else if (onCloseMobile) {
                  onCloseMobile();
                }
              }}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Active Idea Footnote */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-400 truncate">
            {activeIdea ? `Active: ${activeIdea.title}` : "No idea active"}
          </span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
