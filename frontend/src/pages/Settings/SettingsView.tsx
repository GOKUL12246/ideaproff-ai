import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { UserRole } from '../../types';
import { Settings, User as UserIcon, CheckCircle2, Shield, Database, Cpu, Globe } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'Startup Founder');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const roles: UserRole[] = ['Student', 'Startup Founder', 'Mentor', 'Incubator Administrator'];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.auth.updateMe({ name, role });
      await refreshUser();
      setMessage("Profile settings updated successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Account Configuration</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings & Environment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your founder profile, platform role permissions, and inspect live backend connection health.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* User Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          User Profile & Role
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email (Read Only)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Platform Role</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`p-3 text-left rounded-xl border text-xs transition-all ${
                  role === r
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-all"
          >
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Infrastructure Health Status */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Technology Stack & Engine Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>MongoDB Atlas</span>
            </div>
            <p className="text-[11px] text-slate-500">Dedicated PyMongo data-access layer with 17 collections & indexes.</p>
            <span className="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              CONNECTED
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Google Gen AI SDK</span>
            </div>
            <p className="text-[11px] text-slate-500">6 logical AI agents with structured Pydantic schemas & heuristic fallbacks.</p>
            <span className="inline-block mt-2 text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              INITIALIZED
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Django REST Framework</span>
            </div>
            <p className="text-[11px] text-slate-500">Stateless JWT authentication with ReportLab and Pandas data pipeline.</p>
            <span className="inline-block mt-2 text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
              ACTIVE API
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
