import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { RoadmapTask } from '../../types';
import {
  Milestone,
  PlusCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const StartupRoadmap: React.FC = () => {
  const { activeIdea } = useAuth();
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    timeframe: 'Next 7 days' as const,
    title: '',
    description: '',
    priority: 'High' as const,
    deadline_days: 7,
    assigned_user: 'Founder',
    status: 'Pending' as const,
    expected_outcome: ''
  });

  const timeframes: ('Next 7 days' | 'Next 14 days' | 'Next 30 days' | 'Long-term milestones')[] = [
    'Next 7 days',
    'Next 14 days',
    'Next 30 days',
    'Long-term milestones'
  ];

  useEffect(() => {
    if (activeIdea) {
      loadRoadmap();
    } else {
      setLoading(false);
    }
  }, [activeIdea?.id]);

  const loadRoadmap = async () => {
    if (!activeIdea) return;
    try {
      setLoading(true);
      const res = await api.roadmap.list(activeIdea.id);
      setTasks(res.tasks || []);
    } catch (e) {
      console.error("Failed to load roadmap tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    try {
      await api.roadmap.update(taskId, { status: newStatus });
      await loadRoadmap();
    } catch (e: any) {
      alert(e.message || "Failed to update task");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIdea || !newTask.title) return;
    try {
      await api.roadmap.create(activeIdea.id, newTask);
      setShowAddModal(false);
      setNewTask({
        timeframe: 'Next 7 days',
        title: '',
        description: '',
        priority: 'High',
        deadline_days: 7,
        assigned_user: 'Founder',
        status: 'Pending',
        expected_outcome: ''
      });
      setMessage("Roadmap task added successfully!");
      await loadRoadmap();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to add task");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm("Remove this task?")) return;
    try {
      await api.roadmap.delete(taskId);
      await loadRoadmap();
    } catch (e: any) {
      alert(e.message || "Failed to delete task");
    }
  };

  if (!activeIdea) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <Milestone className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Active Startup Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select an active idea from the navbar to view the roadmap.</p>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
            <Milestone className="w-3.5 h-3.5" />
            <span>Actionable Startup Roadmap</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Execution Roadmap — {activeIdea.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized milestones from 7-day customer discovery sprints to long-term incubator diligence.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Progress Bar Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-700">Roadmap Milestone Completion</span>
          <span className="font-extrabold text-blue-600">{completedCount} of {tasks.length} Completed ({progressPct}%)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-600 to-teal-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Grouped Timeframe Columns */}
      <div className="space-y-6">
        {timeframes.map((tf) => {
          const tfTasks = tasks.filter(t => t.timeframe === tf);
          return (
            <div key={tf} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">{tf}</h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">{tfTasks.length} Milestones</span>
              </div>

              <div className="space-y-3">
                {tfTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      task.status === 'Completed'
                        ? 'bg-emerald-50/40 border-emerald-200 text-slate-500'
                        : (task.status === 'In Progress' ? 'bg-blue-50/30 border-blue-200' : 'bg-slate-50 border-slate-200/80')
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className={`text-xs font-bold ${task.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.title}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed max-w-2xl">{task.description}</p>
                      {task.expected_outcome && (
                        <p className="text-[11px] text-teal-800 font-medium">
                          <strong>Expected Outcome:</strong> {task.expected_outcome}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border ${
                          task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          (task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white border-slate-300 text-slate-700')
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {tfTasks.length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">No milestones scheduled for {tf}.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Roadmap Milestone</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Timeframe</label>
                <select
                  value={newTask.timeframe}
                  onChange={(e) => setNewTask({ ...newTask, timeframe: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {timeframes.map((tf) => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Interview 5 target customer prospects"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Specific actions and questions..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Owner</label>
                  <input
                    type="text"
                    value={newTask.assigned_user}
                    onChange={(e) => setNewTask({ ...newTask, assigned_user: e.target.value })}
                    placeholder="e.g. Founder, Growth Lead"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Outcome</label>
                <input
                  type="text"
                  value={newTask.expected_outcome}
                  onChange={(e) => setNewTask({ ...newTask, expected_outcome: e.target.value })}
                  placeholder="e.g. 5 completed customer interview notes"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
