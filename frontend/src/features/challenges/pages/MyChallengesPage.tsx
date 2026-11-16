import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { challengesApi } from '../api/challengesApi';
import { ChallengeEnrollment } from '../types/challenge.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Flame,
  Award,
  ArrowRight,
  CheckCircle,
  Clock,
  Compass,
} from 'lucide-react';

export const MyChallengesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<ChallengeEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await challengesApi.listMyEnrollments();
      setEnrollments(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const activeList = enrollments.filter((e) => e.status === 'ACTIVE');
  const completedList = enrollments.filter((e) => e.status === 'COMPLETED');

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
            <Flame className="h-3.5 w-3.5" />
            <span>Personal Habit Progress</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Challenges</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track daily commitments, celebrate completed protocols, and build momentum.
          </p>
        </div>

        <Link to="/challenges">
          <Button variant="secondary" size="md" className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-400" />
            <span>Browse Library</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-500 text-sm">Loading your enrollments...</div>
      ) : enrollments.length === 0 ? (
        <Card className="border-slate-800 p-12 text-center my-8">
          <Award className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No challenges active right now</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6 max-w-md mx-auto">
            Kickstart your digital balance with a 5-day deep work sprint or a 7-day notification detox.
          </p>
          <Link to="/challenges">
            <Button variant="primary" size="md">
              Find a Challenge to Join
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-10 my-8">
          {/* Active Challenges */}
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Flame className="h-4 w-4 text-emerald-400" /> Active Challenges ({activeList.length})
            </h2>

            {activeList.length === 0 ? (
              <Card className="border-slate-800 p-6 text-center text-xs text-slate-400 bg-slate-900/30">
                You have no active challenges in progress. Ready for your next protocol?
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeList.map((e) => {
                  const challenge = e.challenge;
                  if (!challenge) return null;
                  return (
                    <Card
                      key={e.id}
                      className="border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-mono text-cyan-400">
                            {e.completedDays.length} of {challenge.durationDays} Days Done
                          </span>
                          <span className="font-bold text-white font-mono">{e.progressPercentage}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-4">
                          <div
                            className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${e.progressPercentage}%` }}
                          />
                        </div>

                        <h3 className="text-base font-bold text-white mb-1">{challenge.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-4">{challenge.description}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-mono">
                          Started: {new Date(e.startDate).toLocaleDateString()}
                        </span>

                        <Link to={`/challenges/my/${e.id}`}>
                          <Button variant="primary" size="sm" className="flex items-center gap-1.5 font-bold">
                            <span>Track Progress</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Challenges */}
          {completedList.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-emerald-400" /> Completed Protocols ({completedList.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedList.map((e) => {
                  const challenge = e.challenge;
                  if (!challenge) return null;
                  return (
                    <Card
                      key={e.id}
                      className="border-slate-800 bg-slate-900/30 p-5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{challenge.title}</h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-slate-500" />
                            Completed on {new Date(e.completedDate || e.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Link to={`/challenges/my/${e.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs">
                          Review
                        </Button>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
