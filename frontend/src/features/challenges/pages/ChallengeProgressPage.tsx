import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { challengesApi } from '../api/challengesApi';
import { ChallengeEnrollment } from '../types/challenge.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  ChevronLeft,
  CheckCircle,
  Square,
  Award,
  Sparkles,
  Calendar,
  AlertCircle,
  Trash2,
} from 'lucide-react';

export const ChallengeProgressPage: React.FC = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState<ChallengeEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingDay, setUpdatingDay] = useState<number | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!enrollmentId) return;
    try {
      setIsLoading(true);
      const data = await challengesApi.getMyEnrollmentDetail(enrollmentId);
      setEnrollment(data);
    } catch {
      setErrorMsg('Failed to load challenge progress.');
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleToggleDay = async (dayNumber: number, isCurrentlyDone: boolean) => {
    if (!enrollmentId) return;
    try {
      setUpdatingDay(dayNumber);
      const updated = await challengesApi.updateProgress(enrollmentId, dayNumber, !isCurrentlyDone);
      setEnrollment(updated);
    } catch {
      alert('Failed to update activity status.');
    } finally {
      setUpdatingDay(null);
    }
  };

  const handleCancelEnrollment = async () => {
    if (!enrollment || !enrollment.challenge) return;
    if (!window.confirm('Are you sure you want to withdraw from this challenge?')) return;

    try {
      await challengesApi.cancelEnrollment(enrollment.challenge.id);
      navigate('/challenges/my');
    } catch {
      alert('Failed to cancel enrollment.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        Loading challenge progress...
      </div>
    );
  }

  if (errorMsg || !enrollment || !enrollment.challenge) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-rose-400 mb-2">Enrollment Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          This challenge enrollment does not exist or you do not have permission to view it.
        </p>
        <Link to="/challenges/my">
          <Button variant="secondary" size="sm">
            Back to My Challenges
          </Button>
        </Link>
      </div>
    );
  }

  const challenge = enrollment.challenge;
  const completedDays = enrollment.completedDays || [];
  const isAllComplete = enrollment.status === 'COMPLETED' || completedDays.length >= challenge.durationDays;
  const activities = enrollment.activities || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/challenges/my"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to My Challenges</span>
        </Link>

        <button
          onClick={handleCancelEnrollment}
          className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
          title="Withdraw from challenge"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Withdraw</span>
        </button>
      </div>

      {/* Hero Progress Banner */}
      <Card className="border-slate-800 bg-slate-900/60 p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>Started {new Date(enrollment.startDate).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {challenge.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 px-4 py-3 rounded-2xl shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Progress</span>
              <span className="text-2xl font-black text-white font-mono">
                {enrollment.progressPercentage}%
              </span>
            </div>
            <div className="h-10 w-1 bg-slate-800 rounded-full" />
            <div className="text-left">
              <span className="text-[11px] text-slate-400 block">Days Finished</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {completedDays.length}/{challenge.durationDays}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden my-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAllComplete ? 'bg-emerald-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${enrollment.progressPercentage}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {challenge.description}
        </p>

        {/* Completion Banner */}
        {isAllComplete && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-4 text-emerald-300 animate-fade-in">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Challenge Complete! <Sparkles className="h-4 w-4 text-amber-400" />
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Outstanding dedication! You successfully completed all {challenge.durationDays} days of this protocol.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Non-Shaming Encouragement Notice */}
      <div className="mb-6 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
        <AlertCircle className="h-4 w-4 text-cyan-400 shrink-0" />
        <span>
          Take it at your own pace. If a heavy university deadline causes you to miss a day, pick right back up whenever you are ready.
        </span>
      </div>

      {/* Daily Activities Checklist */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white mb-4">Daily Actions Checklist</h2>

        {activities.map((act) => {
          const isDone = completedDays.includes(act.day);
          const isBusy = updatingDay === act.day;

          return (
            <Card
              key={act.day}
              className={`p-4 border transition-all ${
                isDone
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => handleToggleDay(act.day, isDone)}
                  disabled={isBusy}
                  className="mt-0.5 text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 disabled:opacity-50"
                  title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {isDone ? (
                    <CheckCircle className="h-6 w-6 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Square className="h-6 w-6 text-slate-600 hover:text-slate-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
                      Day {act.day}
                    </span>
                    <h3
                      className={`text-sm font-semibold text-white ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {act.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{act.instructions}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
