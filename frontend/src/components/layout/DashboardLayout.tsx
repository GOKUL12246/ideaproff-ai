import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu, Lightbulb, PlusCircle, Sparkles } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { activeIdea, ideas } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-row">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile subheader button to open sidebar */}
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg"
            >
              <Menu className="w-4 h-4" />
              <span>Menu / Modules</span>
            </button>
            <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
              {activeIdea ? activeIdea.title : "No Idea Selected"}
            </span>
          </div>

          {/* Active Idea Reminder Banner if no idea created yet */}
          {ideas.length === 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-900 text-xs md:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>You have not created or selected a startup idea yet. Create one or load our verified demo to test all validation features!</span>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to="/app/ideas/new"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors inline-flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Idea</span>
                </Link>
              </div>
            </div>
          )}

          <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
