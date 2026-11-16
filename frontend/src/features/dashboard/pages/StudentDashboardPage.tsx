import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { wellnessApi } from '../../wellness/api/wellnessApi';
import { DashboardSummary, FocusSummary } from '../../wellness/types/wellness.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  User,
  Shield,
  Clock,
  Award,
  Layers,
  BookOpen,
  LogOut,
  Calendar,
  Sparkles,
  TrendingUp,
  Smartphone,
  CheckSquare,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const StudentDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [focusSummary, setFocusSummary] = useState<FocusSummary | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [dashData, fSum] = await Promise.all([
        wellnessApi.getDashboardSummary(),
        wellnessApi.getFocusSummary(),
      ]);
      setSummary(dashData);
      setFocusSummary(fSum);
    } catch {
      // Handled silently
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const todayMinutes = summary?.screenTime?.todayMinutes ?? 0;
  const goalDaily = summary?.screenTime?.goal?.maxDailyMinutes ?? 360;
  const goalPercentage = Math.min(100, Math.round((todayMinutes / (goalDaily || 1)) * 100));

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Authenticated Student Portal Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            "Your Digital Life. Your Rules." — Build healthy attention boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => logout()}
            className="flex items-center gap-2 hover:border-rose-500/50 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>

      {/* Profile & Security Credentials Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <Card className="md:col-span-1 border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg font-bold">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" /> Account Role
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 font-semibold font-mono text-[11px]">
                {user?.role}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" /> Status
              </span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Member Since
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </span>
            </div>
          </div>
        </Card>

        {/* Dynamic Wellness Snapshot */}
        <Card className="md:col-span-2 border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Today's Wellness Metrics
              </h2>
              <span className="text-xs text-emerald-400 font-mono">Real-Time DB Sync</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Focus Time */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Today's Focus</span>
                  <span className="text-2xl font-bold text-white font-mono">
                    {summary?.focus?.todayMinutes ?? 0}
                    <span className="text-xs text-slate-500 ml-1">min</span>
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-2">
                  {summary?.focus?.todaySessions ?? 0} sprints completed
                </p>
              </div>

              {/* Screen Time */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Screen-Time</span>
                  <span className="text-2xl font-bold text-cyan-400 font-mono">
                    {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${goalPercentage > 100 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>
              </div>

              {/* Self-Assessment */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Wellness Score</span>
                  <span className="text-2xl font-bold text-white font-mono">
                    {summary?.assessment?.overallScore ?? '—'}
                    {summary?.assessment && <span className="text-xs text-slate-500 ml-1">/100</span>}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-400 mt-2 truncate">
                  {summary?.assessment?.tier || 'No assessment yet'}
                </p>
              </div>
            </div>
          </div>

          {/* Intention banner if present */}
          {summary?.planner && (
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 mt-4 text-xs flex items-center justify-between text-slate-300">
              <span className="truncate">
                <strong className="text-emerald-400 mr-2">Today's Intention:</strong>
                "{summary.planner.digitalIntention}"
              </span>
              <span className="text-slate-500 font-mono shrink-0 ml-2">
                {summary.planner.completedTasks}/{summary.planner.totalTasks} tasks done
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Weekly Focus Time Chart */}
      <div className="my-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-emerald-400" /> Weekly Deep Work Trend
        </h2>

        <Card className="border-slate-800 bg-slate-900/40 p-6">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusSummary?.weeklyTrend || []}>
                <XAxis dataKey="dayName" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  unit="m"
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Bar dataKey="minutes" name="Focus Time (min)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white mb-4">Student Wellness Core Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/focus"
            className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-emerald-400 transition-colors">
                Focus Sprint Timer
              </h3>
              <p className="text-xs text-slate-400">
                Circular Pomodoro timer with pre-session intentions and distraction logs.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-4">
              <span>Start Sprint</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/screen-time"
            className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-cyan-400 transition-colors">
                Screen-Time Tracker
              </h3>
              <p className="text-xs text-slate-400">
                Manual daily device logs, category breakdowns, and healthy bedtime goals.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold mt-4">
              <span>View Logs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/planner"
            className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-teal-500/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CheckSquare className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-teal-400 transition-colors">
                Daily Planner
              </h3>
              <p className="text-xs text-slate-400">
                Set digital boundary intentions, prioritize tasks, and execute digital shutdowns.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-teal-400 font-semibold mt-4">
              <span>Open Planner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/assessment"
            className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-indigo-400 transition-colors">
                Self-Assessment
              </h3>
              <p className="text-xs text-slate-400">
                10-question evaluation of screen fatigue, sleep hygiene, and attention habits.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-indigo-400 font-semibold mt-4">
              <span>Take Assessment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Public Discovery Modules Footer Links */}
      <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <span>Also explore knowledge base resources:</span>
        <div className="flex items-center gap-4">
          <Link to="/resources" className="hover:text-emerald-400 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> Resource Library
          </Link>
          <Link to="/guides" className="hover:text-emerald-400 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Device Guides
          </Link>
          <Link to="/challenges" className="hover:text-emerald-400 flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> Habit Challenges
          </Link>
        </div>
      </div>
    </div>
  );
};
