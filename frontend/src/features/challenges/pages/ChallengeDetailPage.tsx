import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { challengesApi } from '../api/challengesApi';
import { Challenge, ChallengeDifficulty } from '../types/challenge.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Clock,
  ArrowRight,
  ChevronLeft,
  Flame,
  Calendar,
  CheckCircle,
} from 'lucide-react';

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, { label: string; class: string }> = {
  BEGINNER: { label: 'Beginner', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  INTERMEDIATE: { label: 'Intermediate', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  ADVANCED: { label: 'Advanced', class: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

export const ChallengeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await challengesApi.getChallenge(id);
      setChallenge(data);
    } catch {
      setErrorMsg('Failed to load challenge details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (!challenge) return;

    try {
      setIsEnrolling(true);
      const enrollment = await challengesApi.enroll(challenge.id);
      navigate(`/challenges/my/${enrollment.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to enroll in challenge.';
      alert(msg);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        Loading challenge details...
      </div>
    );
  }

  if (errorMsg || !challenge) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-rose-400 mb-2">Challenge Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">The requested wellness challenge does not exist or has been removed.</p>
        <Link to="/challenges">
          <Button variant="secondary" size="sm">
            Back to Challenges
          </Button>
        </Link>
      </div>
    );
  }

  const diff = DIFFICULTY_STYLES[challenge.difficulty] || DIFFICULTY_STYLES.BEGINNER;
  const isEnrolled = challenge.isEnrolled;
  const enrollmentId = challenge.userEnrollment?.id;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      {/* Back Button */}
      <Link
        to="/challenges"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back to All Challenges</span>
      </Link>

      {/* Main Challenge Hero Card */}
      <Card className="border-slate-800 bg-slate-900/60 p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${diff.class}`}
          >
            {diff.label} Protocol
          </span>
          <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50">
            <Clock className="h-3.5 w-3.5" />
            {challenge.durationDays} Days Duration
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4">
          {challenge.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-2xl">
          {challenge.description}
        </p>

        {/* CTA Banner */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <p className="font-semibold text-slate-200">Self-Paced & Non-Shaming</p>
            <p className="mt-0.5">Missed days can be picked up anytime. Zero penalty for busy exam weeks.</p>
          </div>

          <div>
            {isEnrolled && enrollmentId ? (
              <Link to={`/challenges/my/${enrollmentId}`}>
                <Button variant="primary" size="md" className="flex items-center gap-2 font-bold">
                  <CheckCircle className="h-4 w-4" />
                  <span>Resume My Challenge ({challenge.userEnrollment?.progressPercentage ?? 0}%)</span>
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="flex items-center gap-2 font-bold shadow-lg shadow-emerald-500/20"
              >
                <Flame className="h-4 w-4" />
                <span>{isEnrolling ? 'Joining...' : 'Join Challenge'}</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Daily Curriculum Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-emerald-400" /> Daily Action Curriculum
        </h2>

        {(challenge.activities || []).map((act) => (
          <div
            key={act.day}
            className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-4 transition-colors hover:border-slate-700"
          >
            <div className="h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0">
              {act.day}
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">{act.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{act.instructions}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA for un-enrolled */}
      {!isEnrolled && (
        <div className="mt-10 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
          <h3 className="text-base font-bold text-white mb-2">Ready to reclaim your focus?</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
            Take on this {challenge.durationDays}-day protocol. One intentional micro-habit each day.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="font-bold inline-flex items-center gap-2"
          >
            <span>{isAuthenticated ? 'Join Challenge Now' : 'Sign in to Enroll'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
