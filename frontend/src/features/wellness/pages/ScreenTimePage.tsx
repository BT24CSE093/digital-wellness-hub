import React, { useState, useEffect, useCallback } from 'react';
import { wellnessApi } from '../api/wellnessApi';
import { ScreenTimeSummary, ScreenTimeLog, ScreenTimeGoal } from '../types/wellness.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Smartphone,
  Target,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const ScreenTimePage: React.FC = () => {
  const [summary, setSummary] = useState<ScreenTimeSummary | null>(null);
  const [logs, setLogs] = useState<ScreenTimeLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Log Form State
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [totalHours, setTotalHours] = useState<number>(4);
  const [totalMins, setTotalMins] = useState<number>(30);
  const [productiveMins, setProductiveMins] = useState<number>(120);
  const [distractingMins, setDistractingMins] = useState<number>(90);
  const [pickups, setPickups] = useState<number>(45);
  const [socialMediaMins, setSocialMediaMins] = useState<number>(60);
  const [entertainmentMins, setEntertainmentMins] = useState<number>(30);
  const [educationMins, setEducationMins] = useState<number>(90);
  const [gamingMins, setGamingMins] = useState<number>(0);
  const [productivityMins, setProductivityMins] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);

  // Goal Form State
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [goalDailyMinutes, setGoalDailyMinutes] = useState<number>(360);
  const [goalDistractingMinutes, setGoalDistractingMinutes] = useState<number>(120);
  const [goalBedtimeHour, setGoalBedtimeHour] = useState<number>(23);
  const [isSubmittingGoal, setIsSubmittingGoal] = useState<boolean>(false);

  const [notification, setNotification] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sumData, logsData] = await Promise.all([
        wellnessApi.getScreenTimeSummary(),
        wellnessApi.getScreenTimeLogs(14),
      ]);
      setSummary(sumData);
      setLogs(logsData);
      if (sumData.goal) {
        setGoalDailyMinutes(sumData.goal.maxDailyMinutes);
        setGoalDistractingMinutes(sumData.goal.maxDistractingMinutes);
        setGoalBedtimeHour(sumData.goal.targetBedtimeHour);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLog(true);
    const calculatedTotal = totalHours * 60 + totalMins;

    try {
      await wellnessApi.logScreenTime({
        logDate,
        totalMinutes: calculatedTotal,
        productiveMinutes: productiveMins,
        distractingMinutes: distractingMins,
        pickupsCount: pickups,
        categoryBreakdown: {
          socialMedia: socialMediaMins,
          entertainment: entertainmentMins,
          education: educationMins,
          gaming: gamingMins,
          productivity: productivityMins,
        },
        notes: notes.trim() || undefined,
      });

      setShowLogModal(false);
      setNotification(`Saved screen-time entry for ${logDate}.`);
      setTimeout(() => setNotification(null), 4000);
      fetchData();
    } catch {
      alert('Failed to save screen-time entry. Verify inputs.');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGoal(true);
    try {
      const updated: Partial<ScreenTimeGoal> = {
        maxDailyMinutes: goalDailyMinutes,
        maxDistractingMinutes: goalDistractingMinutes,
        targetBedtimeHour: goalBedtimeHour,
      };
      await wellnessApi.updateScreenTimeGoal(updated);
      setShowGoalModal(false);
      setNotification('Updated your screen-time goals.');
      setTimeout(() => setNotification(null), 4000);
      fetchData();
    } catch {
      alert('Failed to update goal.');
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Delete this screen-time log?')) return;
    try {
      await wellnessApi.deleteScreenTimeLog(id);
      setNotification('Deleted screen-time record.');
      setTimeout(() => setNotification(null), 4000);
      fetchData();
    } catch {
      alert('Failed to delete log.');
    }
  };

  const todayMinutes = summary?.todayLog?.totalMinutes ?? 0;
  const goalMinutes = summary?.goal?.maxDailyMinutes ?? 360;
  const percentageUsed = Math.min(100, Math.round((todayMinutes / (goalMinutes || 1)) * 100));
  const isOverGoal = todayMinutes > goalMinutes;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-2">
            <Smartphone className="h-3.5 w-3.5" />
            <span>Digital Awareness & Boundaries</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manual Screen-Time Log</h1>
          <p className="text-slate-400 text-sm mt-1">
            Empowering students with non-intrusive, self-reported device time awareness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 border-slate-700"
          >
            <Target className="h-4 w-4 text-cyan-400" />
            <span>Edit Daily Goals</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Log Today's Usage</span>
          </Button>
        </div>
      </div>

      {notification && (
        <div className="my-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Goal & Daily Usage Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        {/* Today's Usage vs Goal Progress */}
        <Card className="md:col-span-2 border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Today's Screen Time vs Limit
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  isOverGoal
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isOverGoal ? 'Daily Limit Exceeded' : `${percentageUsed}% of Limit`}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-3xl font-extrabold text-white font-mono">
                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
              </span>
              <span className="text-sm text-slate-400">
                / {Math.floor(goalMinutes / 60)}h {goalMinutes % 60}m limit
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden my-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverGoal ? 'bg-rose-500' : percentageUsed > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (todayMinutes / goalMinutes) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Remaining Budget:</span>
              <span className="font-semibold text-white font-mono">
                {isOverGoal ? (
                  <span className="text-rose-400">0 min (Exceeded by {todayMinutes - goalMinutes}m)</span>
                ) : (
                  `${Math.floor((goalMinutes - todayMinutes) / 60)}h ${(goalMinutes - todayMinutes) % 60}m`
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 mt-4 text-center">
            <div className="p-2 rounded-lg bg-slate-950/40">
              <span className="text-[11px] text-slate-500 block">Productive</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {summary?.todayLog?.productiveMinutes ?? 0}m
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/40">
              <span className="text-[11px] text-slate-500 block">Distracting</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {summary?.todayLog?.distractingMinutes ?? 0}m
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/40">
              <span className="text-[11px] text-slate-500 block">Pickups</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">
                {summary?.todayLog?.pickupsCount ?? 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Weekly Stats Summary */}
        <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingDown className="h-4 w-4 text-cyan-400" /> Weekly Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50">
                <span className="text-slate-400">7-Day Total</span>
                <span className="font-bold text-white font-mono">
                  {Math.floor((summary?.weeklyTotalMinutes ?? 0) / 60)}h {(summary?.weeklyTotalMinutes ?? 0) % 60}m
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50">
                <span className="text-slate-400">Daily Average</span>
                <span className="font-bold text-cyan-400 font-mono">
                  {Math.floor((summary?.weeklyAvgMinutes ?? 0) / 60)}h {(summary?.weeklyAvgMinutes ?? 0) % 60}m
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50">
                <span className="text-slate-400">Target Bedtime</span>
                <span className="font-bold text-indigo-400 font-mono">
                  {(summary?.goal?.targetBedtimeHour ?? 23)}:00
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800/80">
            Log each evening from your iOS Screen Time or Android Digital Wellbeing report.
          </p>
        </Card>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="my-8">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" /> Past 7 Days Usage Trend
        </h2>

        <Card className="border-slate-800 p-6 bg-slate-900/40">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.weeklyTrend || []}>
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="productiveMinutes" name="Productive (min)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="distractingMinutes" name="Distracting (min)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent History Table */}
      <div className="mt-10">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" /> Historical Entries
        </h2>

        <Card className="border-slate-800 overflow-hidden p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading screen-time records...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No screen-time records logged yet. Click "Log Today's Usage" above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total Time</th>
                    <th className="px-4 py-3">Productive</th>
                    <th className="px-4 py-3">Distracting</th>
                    <th className="px-4 py-3">Pickups</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 text-white font-mono font-medium">
                        {new Date(log.logDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                        {Math.floor(log.totalMinutes / 60)}h {log.totalMinutes % 60}m
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400">
                        {log.productiveMinutes}m
                      </td>
                      <td className="px-4 py-3 font-mono text-amber-400">
                        {log.distractingMinutes}m
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {log.pickupsCount}
                      </td>
                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                        {log.notes || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-slate-700 bg-slate-900 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-2">Log Daily Screen Time</h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter your self-reported screen time metrics from your device settings.
            </p>

            <form onSubmit={handleSaveLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Pickups Count</label>
                  <input
                    type="number"
                    min="0"
                    value={pickups}
                    onChange={(e) => setPickups(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Total Screen Time</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={totalHours}
                      onChange={(e) => setTotalHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400">hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={totalMins}
                      onChange={(e) => setTotalMins(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400">mins</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-400 font-medium mb-1">Productive Minutes</label>
                  <input
                    type="number"
                    min="0"
                    value={productiveMins}
                    onChange={(e) => setProductiveMins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-medium mb-1">Distracting Minutes</label>
                  <input
                    type="number"
                    min="0"
                    value={distractingMins}
                    onChange={(e) => setDistractingMins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Category Breakdown (Minutes)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 text-[11px] block">Social Media</label>
                    <input
                      type="number"
                      min="0"
                      value={socialMediaMins}
                      onChange={(e) => setSocialMediaMins(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Entertainment</label>
                    <input
                      type="number"
                      min="0"
                      value={entertainmentMins}
                      onChange={(e) => setEntertainmentMins(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Education</label>
                    <input
                      type="number"
                      min="0"
                      value={educationMins}
                      onChange={(e) => setEducationMins(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Gaming</label>
                    <input
                      type="number"
                      min="0"
                      value={gamingMins}
                      onChange={(e) => setGamingMins(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Productivity</label>
                    <input
                      type="number"
                      min="0"
                      value={productivityMins}
                      onChange={(e) => setProductivityMins(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Personal Reflection / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Spent 1 hour doomscrolling after dinner; read articles during commute."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  disabled={isSubmittingLog}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmittingLog}
                >
                  {isSubmittingLog ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="w-full max-w-md border-slate-700 bg-slate-900 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Adjust Screen-Time Goals</h3>
            <p className="text-xs text-slate-400 mb-6">
              Establish healthy personal limits to foster mindful device habits.
            </p>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Daily Maximum Screen Time ({Math.floor(goalDailyMinutes / 60)}h {goalDailyMinutes % 60}m)
                </label>
                <input
                  type="range"
                  min="60"
                  max="720"
                  step="30"
                  value={goalDailyMinutes}
                  onChange={(e) => setGoalDailyMinutes(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Max Distracting Apps Allowance ({Math.floor(goalDistractingMinutes / 60)}h {goalDistractingMinutes % 60}m)
                </label>
                <input
                  type="range"
                  min="30"
                  max="360"
                  step="15"
                  value={goalDistractingMinutes}
                  onChange={(e) => setGoalDistractingMinutes(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Target Evening Digital Sunset Hour ({goalBedtimeHour}:00)
                </label>
                <input
                  type="range"
                  min="19"
                  max="24"
                  step="1"
                  value={goalBedtimeHour}
                  onChange={(e) => setGoalBedtimeHour(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <span className="text-[11px] text-slate-500">
                  Ideal hour to turn off interactive screens for restorative sleep.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  disabled={isSubmittingGoal}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmittingGoal}
                >
                  {isSubmittingGoal ? 'Saving...' : 'Update Goals'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
