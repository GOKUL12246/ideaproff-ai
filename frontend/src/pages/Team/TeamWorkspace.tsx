import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Users, Mail, PlusCircle, CheckCircle2, Shield, Clock, X } from 'lucide-react';

export const TeamWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Collaborator');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [teamRes, actRes] = await Promise.all([
        api.team.get(),
        api.dashboard.activity()
      ]);
      setTeam(teamRes.team);
      setMembers(teamRes.members || []);
      setActivities(actRes.activities || []);
    } catch (e) {
      console.error("Failed to load team data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      await api.team.invite({ email: inviteEmail, role: inviteRole });
      setShowInviteModal(false);
      setInviteEmail('');
      setMessage(`Invitation sent to ${inviteEmail}!`);
      await loadTeamData();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to invite member");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Collaboration & Role Permissions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Team Workspace & Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Invite co-founders, student team members, mentors, and incubator reviewers.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Workspace Members
        </h2>

        <div className="divide-y divide-slate-100">
          {/* Workspace Owner */}
          <div className="py-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <p className="font-bold text-slate-900">{user?.name} (You)</p>
                <p className="text-slate-500 text-[11px]">{user?.email}</p>
              </div>
            </div>
            <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-200 text-[10px]">
              Workspace Owner • {user?.role}
            </span>
          </div>

          {/* Invited Members */}
          {members.map((m) => (
            <div key={m.id} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                  {m.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{m.email}</p>
                  <p className="text-slate-400 text-[11px]">Invited {new Date(m.invited_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-full text-[10px]">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Role-Based Permissions Reference */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Role-Based Access Matrix</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-blue-700 block mb-1">Student</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Full access to validate student ventures, run surveys, model initial financials, and download reports.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-indigo-700 block mb-1">Startup Founder</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Unlimited idea portfolios, AI orchestration, full competitor benchmarking, and investor-ready PDF packages.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-teal-700 block mb-1">Mentor</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Reviewer access to inspect empirical survey evidence, critique roadmap tasks, and audit unit economics.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-amber-700 block mb-1">Incubator Admin</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Cohort-wide benchmarking, objective grant diligence tracking, and standardized readiness scoring.
            </p>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Clock className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900">Workspace Activity Audit Trail</h2>
        </div>

        <div className="space-y-3">
          {activities.map((act) => (
            <div key={act.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">{act.action}</span>
                  <p className="text-slate-500 text-[11px]">{act.details}</p>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">
                {new Date(act.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-xs text-slate-400 py-6 text-center">No activity recorded yet.</p>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Invite Team Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Collaborator">Collaborator</option>
                  <option value="Co-Founder">Co-Founder</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Reviewer">Reviewer</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
