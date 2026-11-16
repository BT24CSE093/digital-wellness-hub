import React, { useState, useEffect, useRef, useCallback } from 'react';
import { wellnessApi } from '../api/wellnessApi';
import { FocusSession, FocusSummary, SessionType } from '../types/wellness.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Flame,
  Star,
  Sparkles,
  Award,
  AlertCircle,
  Volume2,
} from 'lucide-react';

const MODE_CONFIG: Record<SessionType, { name: string; defaultMinutes: number; color: string; ringColor: string }> = {
  POMODORO: { name: 'Focus Sprint', defaultMinutes: 25, color: 'text-emerald-400', ringColor: '#10b981' },
  SHORT_BREAK: { name: 'Short Break', defaultMinutes: 5, color: 'text-teal-400', ringColor: '#14b8a6' },
  LONG_BREAK: { name: 'Long Break', defaultMinutes: 15, color: 'text-cyan-400', ringColor: '#06b6d4' },
  CUSTOM: { name: 'Custom Session', defaultMinutes: 45, color: 'text-indigo-400', ringColor: '#6366f1' },
};

export const FocusTimerPage: React.FC = () => {
  const [sessionType, setSessionType] = useState<SessionType>('POMODORO');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [intention, setIntention] = useState<string>('');
  const [reflection, setReflection] = useState<string>('');
  const [distractionsCount, setDistractionsCount] = useState<number>(0);
  const [focusRating, setFocusRating] = useState<number>(5);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completedDuration, setCompletedDuration] = useState<number>(25);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // History & Stats
  const [summary, setSummary] = useState<FocusSummary | null>(null);
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Ref to track exact target timestamp to avoid background tab drift
  const targetEndTimeRef = useRef<number | null>(null);

  const fetchStatsAndHistory = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const [sumData, sessionsData] = await Promise.all([
        wellnessApi.getFocusSummary(),
        wellnessApi.getFocusSessions(1, 10),
      ]);
      setSummary(sumData);
      setRecentSessions(sessionsData.sessions);
    } catch {
      // Ignored for offline or guest
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStatsAndHistory();
  }, [fetchStatsAndHistory]);

  // Mode change handler
  const handleModeChange = (newMode: SessionType) => {
    if (isRunning) {
      if (!window.confirm('Switching modes will reset your current timer. Continue?')) {
        return;
      }
    }
    const targetMin = MODE_CONFIG[newMode].defaultMinutes;
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setSessionType(newMode);
    setDurationMinutes(targetMin);
    setRemainingSeconds(targetMin * 60);
  };

  // Timer Tick Mechanism using Date.now() timestamp
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
      }

      intervalId = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));

        setRemainingSeconds(diff);

        if (diff <= 0) {
          clearInterval(intervalId!);
          setIsRunning(false);
          targetEndTimeRef.current = null;
          setCompletedDuration(durationMinutes);
          setShowCompletionModal(true);
          try {
            // Optional browser audio chime using Web Audio API
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
          } catch {
            // Audio context disallowed by browser policy without user gesture
          }
        }
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, remainingSeconds, durationMinutes]);

  const handleStart = () => {
    targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
  };

  const handleReset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setRemainingSeconds(durationMinutes * 60);
  };

  const handleSaveCompletedSession = async () => {
    setIsSubmitting(true);
    try {
      await wellnessApi.createFocusSession({
        sessionType,
        durationMinutes: completedDuration,
        intention: intention.trim() || undefined,
        reflection: reflection.trim() || undefined,
        distractionsCount,
        focusRating,
      });

      setShowCompletionModal(false);
      setIntention('');
      setReflection('');
      setDistractionsCount(0);
      setFocusRating(5);
      setRemainingSeconds(durationMinutes * 60);
      setSaveSuccessNotice(`Logged ${completedDuration} minutes of deep focus!`);
      setTimeout(() => setSaveSuccessNotice(null), 5000);
      fetchStatsAndHistory();
    } catch {
      alert('Failed to save focus session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Time calculations
  const totalDurationSeconds = durationMinutes * 60;
  const progressRatio = totalDurationSeconds > 0 ? (totalDurationSeconds - remainingSeconds) / totalDurationSeconds : 0;
  const minutesDisplay = Math.floor(remainingSeconds / 60);
  const secondsDisplay = remainingSeconds % 60;
  const formattedTime = `${String(minutesDisplay).padStart(2, '0')}:${String(secondsDisplay).padStart(2, '0')}`;

  // SVG circular ring properties
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
            <Clock className="h-3.5 w-3.5" />
            <span>Pomodoro Deep Work Protocol</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Focus Sprint Timer</h1>
          <p className="text-slate-400 text-sm mt-1">
            Reclaim attention span with high-friction, interval-based deep work.
          </p>
        </div>

        {saveSuccessNotice && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 animate-fade-in">
            <CheckCircle className="h-4 w-4" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center my-8">
        <div className="inline-flex p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
          {(Object.keys(MODE_CONFIG) as SessionType[]).map((mode) => {
            const isActive = sessionType === mode;
            return (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {MODE_CONFIG[mode].name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-2 border-slate-800 flex flex-col items-center justify-center py-10 relative overflow-hidden bg-slate-900/40">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute h-72 w-72 rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-700"
            style={{ backgroundColor: MODE_CONFIG[sessionType].ringColor }}
          />

          {/* Optional Intention Banner */}
          <div className="w-full max-w-md px-4 mb-6 text-center">
            {isRunning ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="font-medium text-white">{intention || 'Silent deep focus session'}</span>
              </div>
            ) : (
              <input
                type="text"
                placeholder="What is your single focus intention for this sprint?"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-white text-sm placeholder-slate-500 text-center focus:outline-none focus:border-emerald-500/50"
              />
            )}
          </div>

          {/* Circular Countdown Ring */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform">
              {/* Background Track */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="text-slate-800/80 stroke-current"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Indicator */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke={MODE_CONFIG[sessionType].ringColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-linear"
              />
            </svg>

            {/* Centered Digital Countdown */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-5xl sm:text-6xl font-extrabold text-white font-mono tracking-tight">
                {formattedTime}
              </span>
              <span className={`text-xs uppercase font-bold tracking-widest mt-2 ${MODE_CONFIG[sessionType].color}`}>
                {MODE_CONFIG[sessionType].name}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4 mt-6">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleReset}
              className="rounded-2xl h-12 w-12 p-0 flex items-center justify-center text-slate-400 hover:text-white"
              title="Reset Timer"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            {!isRunning ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleStart}
                className="px-8 py-3 rounded-2xl flex items-center gap-2 text-base shadow-lg shadow-emerald-500/25 font-bold"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Start Sprint</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePause}
                className="px-8 py-3 rounded-2xl flex items-center gap-2 text-base border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold"
              >
                <Pause className="h-5 w-5 fill-current" />
                <span>Pause</span>
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setDistractionsCount((prev) => prev + 1);
              }}
              className="rounded-2xl px-4 text-xs flex items-center gap-1.5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              title="Log Distraction"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Distraction ({distractionsCount})</span>
            </Button>
          </div>
        </Card>

        {/* Focus Stats Side Panel */}
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Flame className="h-4 w-4 text-emerald-400" /> Today's Focus Metrics
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400">Today's Focus Time</span>
                <span className="text-base font-bold text-white font-mono">
                  {summary?.todayMinutes ?? 0} <span className="text-xs text-slate-500">min</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400">Completed Sprints</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {summary?.todaySessions ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400">Past 7 Days</span>
                <span className="text-base font-bold text-white font-mono">
                  {summary?.weekMinutes ?? 0} <span className="text-xs text-slate-500">min</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400">Average Focus Rating</span>
                <span className="text-base font-bold text-amber-400 font-mono flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {summary?.avgFocusRating ?? '—'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="border-slate-800 bg-slate-900/30 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Volume2 className="h-4 w-4 text-teal-400" />
              <span>Flow State Tips</span>
            </div>
            <p>1. Put your phone in "Do Not Disturb" mode and keep it out of arm's reach.</p>
            <p>2. Keep a blank scratchpad beside your keyboard to write intrusive thoughts without switching tabs.</p>
          </Card>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-400" /> Recent Completed Sprints
        </h2>

        <Card className="border-slate-800 overflow-hidden p-0">
          {isLoadingStats ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading sessions history...</div>
          ) : recentSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No focus sessions recorded yet. Start your first sprint above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                  <tr>
                    <th className="px-4 py-3">Completed At</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Intention</th>
                    <th className="px-4 py-3">Distractions</th>
                    <th className="px-4 py-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 text-slate-300 font-mono">
                        {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">
                        {s.sessionType}
                      </td>
                      <td className="px-4 py-3 text-white font-mono">{s.durationMinutes} min</td>
                      <td className="px-4 py-3 text-slate-300 max-w-xs truncate">
                        {s.intention || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{s.distractionsCount}</td>
                      <td className="px-4 py-3 text-amber-400 font-semibold flex items-center gap-1">
                        {s.focusRating ? (
                          <>
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {s.focusRating}/5
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Session Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="w-full max-w-md border-slate-700 bg-slate-900 shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Sprint Completed!</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              You just finished {completedDuration} minutes of focused work. Take 30 seconds to reflect and log your session.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Intention Worked On
                </label>
                <input
                  type="text"
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="e.g. Completed Chapter 4 review"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Distractions Encountered ({distractionsCount})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDistractionsCount((c) => Math.max(0, c - 1))}
                    className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold text-white">{distractionsCount}</span>
                  <button
                    type="button"
                    onClick={() => setDistractionsCount((c) => c + 1)}
                    className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Focus Quality Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFocusRating(star)}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
                        focusRating >= star
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-950 text-slate-600 border border-slate-800'
                      }`}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Brief Reflection (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What worked well? What broke your momentum?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCompletionModal(false)}
                  disabled={isSubmitting}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveCompletedSession}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save to Dashboard'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
