import React, { useState, useEffect, useCallback } from 'react';
import { wellnessApi } from '../api/wellnessApi';
import { DailyPlan, PlannerTask, TaskPriority } from '../types/wellness.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Calendar,
  CheckCircle,
  Plus,
  Trash2,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';

const PRIORITY_BADGES: Record<TaskPriority, { label: string; class: string }> = {
  HIGH: { label: 'High Priority', class: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  MEDIUM: { label: 'Medium', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  LOW: { label: 'Low', class: 'bg-slate-800 text-slate-400 border-slate-700' },
};

export const DailyPlannerPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Intention edit state
  const [intentionInput, setIntentionInput] = useState<string>('');
  const [isEditingIntention, setIsEditingIntention] = useState<boolean>(false);

  // New task form state
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [newTaskMins, setNewTaskMins] = useState<number>(30);
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

  const [notification, setNotification] = useState<string | null>(null);

  const fetchPlan = useCallback(async (dateStr: string) => {
    try {
      setIsLoading(true);
      const data = await wellnessApi.getDailyPlanner(dateStr);
      setPlan(data);
      if (data) {
        setIntentionInput(data.digitalIntention);
      } else {
        setIntentionInput('');
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan(selectedDate);
  }, [fetchPlan, selectedDate]);

  const handleDateShift = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleSaveIntention = async () => {
    if (!intentionInput.trim()) {
      alert('Please enter a digital intention for your study day.');
      return;
    }

    try {
      const updated = await wellnessApi.upsertDailyPlanner({
        planDate: selectedDate,
        digitalIntention: intentionInput.trim(),
        priorityTasks: plan?.priorityTasks || [],
      });
      setPlan(updated);
      setIsEditingIntention(false);
      setNotification('Saved your digital intention!');
      setTimeout(() => setNotification(null), 3000);
    } catch {
      alert('Failed to save intention.');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const task: PlannerTask = {
      id: `task_${Date.now()}`,
      text: newTaskText.trim(),
      priority: newTaskPriority,
      completed: false,
      timeEstimateMinutes: newTaskMins,
    };

    const currentTasks = plan?.priorityTasks || [];
    const updatedTasks = [...currentTasks, task];

    try {
      const updated = await wellnessApi.upsertDailyPlanner({
        planDate: selectedDate,
        digitalIntention: intentionInput.trim() || 'Mindful and focused study',
        priorityTasks: updatedTasks,
      });
      setPlan(updated);
      setNewTaskText('');
      setIsAddingTask(false);
    } catch {
      alert('Failed to add task.');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!plan) return;
    const updatedTasks = plan.priorityTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    try {
      const updated = await wellnessApi.updateDailyPlanner(selectedDate, {
        priorityTasks: updatedTasks,
      });
      setPlan(updated);
    } catch {
      alert('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!plan) return;
    const updatedTasks = plan.priorityTasks.filter((t) => t.id !== taskId);

    try {
      const updated = await wellnessApi.updateDailyPlanner(selectedDate, {
        priorityTasks: updatedTasks,
      });
      setPlan(updated);
    } catch {
      alert('Failed to delete task.');
    }
  };

  const handleToggleShutdown = async () => {
    if (!plan) return;
    const newStatus = !plan.shutdownCompleted;

    try {
      const updated = await wellnessApi.updateDailyPlanner(selectedDate, {
        shutdownCompleted: newStatus,
      });
      setPlan(updated);
      setNotification(
        newStatus
          ? 'Digital Shutdown Complete. Time to disconnect and recharge!'
          : 'Reopened active planner.'
      );
      setTimeout(() => setNotification(null), 4000);
    } catch {
      alert('Failed to update digital shutdown status.');
    }
  };

  const tasks = plan?.priorityTasks || [];
  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Intentional Daily Structure</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Daily Wellness Planner</h1>
          <p className="text-slate-400 text-sm mt-1">
            Align daily study priorities with conscious screen boundaries.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => handleDateShift(-1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Previous Day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono font-bold text-white px-2">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <button
            onClick={() => handleDateShift(1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Next Day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            className="px-2 py-1 text-[11px] rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
          >
            Today
          </button>
        </div>
      </div>

      {notification && (
        <div className="my-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Digital Intention Card */}
      <Card className="my-6 border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> Daily Digital Boundary Intention
          </span>
          {!isEditingIntention && plan && (
            <button
              onClick={() => setIsEditingIntention(true)}
              className="text-xs text-slate-400 hover:text-emerald-400 underline"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingIntention || !plan ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="e.g. No notifications until 12 PM; 3 uninterrupted Pomodoro sessions."
              value={intentionInput}
              onChange={(e) => setIntentionInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              {plan && (
                <Button variant="secondary" size="sm" onClick={() => setIsEditingIntention(false)}>
                  Cancel
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={handleSaveIntention}>
                Save Intention
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-white italic">"{plan.digitalIntention}"</p>
        )}
      </Card>

      {/* Priority Tasks List */}
      <div className="my-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-emerald-400" /> Priority Study Tasks
            </h2>
            <span className="text-xs text-slate-400">
              {completedTasks} of {tasks.length} tasks completed
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </Button>
        </div>

        {/* Add Task Sub-Form */}
        {isAddingTask && (
          <Card className="mb-4 border-slate-700 bg-slate-900 p-4">
            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Name</label>
                <input
                  type="text"
                  placeholder="e.g. Finish Data Structures Problem Set"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Minutes</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    step="5"
                    value={newTaskMins}
                    onChange={(e) => setNewTaskMins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddingTask(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Add Task
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Task Items */}
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 text-xs">Loading daily plan...</div>
        ) : tasks.length === 0 ? (
          <Card className="border-slate-800 p-8 text-center text-xs text-slate-500">
            No priority tasks added for this date. Click "Add Task" to plan your high-value study blocks.
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    {task.completed ? (
                      <CheckSquare className="h-5 w-5 fill-emerald-500/20 text-emerald-400" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <span
                    className={`text-xs font-medium text-white ${
                      task.completed ? 'line-through text-slate-500' : ''
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {task.priority && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        PRIORITY_BADGES[task.priority].class
                      }`}
                    >
                      {PRIORITY_BADGES[task.priority].label}
                    </span>
                  )}
                  {task.timeEstimateMinutes && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {task.timeEstimateMinutes}m
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evening Digital Shutdown Protocol */}
      <Card className="mt-10 border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-400" /> Evening Digital Shutdown Routine
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Close your tabs, review tomorrow's plan, and transition away from screens before bed.
            </p>
          </div>

          <Button
            variant={plan?.shutdownCompleted ? 'secondary' : 'primary'}
            size="md"
            onClick={handleToggleShutdown}
            className={`font-semibold text-xs ${
              plan?.shutdownCompleted
                ? 'border-emerald-500/30 text-emerald-400'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {plan?.shutdownCompleted ? '✓ Shutdown Completed' : 'Complete Shutdown Protocol'}
          </Button>
        </div>

        {plan?.shutdownCompleted && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2 text-emerald-300">
            <AlertCircle className="h-4 w-4" />
            <span>
              Shutdown logged at {new Date(plan.shutdownAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Sleep well!
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};
