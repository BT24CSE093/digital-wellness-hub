import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { challengesApi } from '../api/challengesApi';
import { Challenge, ChallengeDifficulty } from '../types/challenge.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Award,
  Clock,
  Search,
  Users,
  Compass,
  ArrowRight,
  Flame,
  CheckCircle,
} from 'lucide-react';

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, { label: string; class: string }> = {
  BEGINNER: { label: 'Beginner', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  INTERMEDIATE: { label: 'Intermediate', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  ADVANCED: { label: 'Advanced', class: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

export const ChallengeListPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [durationFilter, setDurationFilter] = useState<string>('ALL');

  const fetchChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
      let minDuration: number | undefined = undefined;
      let maxDuration: number | undefined = undefined;

      if (durationFilter === 'SHORT') {
        maxDuration = 5;
      } else if (durationFilter === 'WEEK') {
        minDuration = 6;
        maxDuration = 8;
      } else if (durationFilter === 'LONG') {
        minDuration = 9;
      }

      const diff = difficultyFilter !== 'ALL' ? (difficultyFilter as ChallengeDifficulty) : undefined;

      const data = await challengesApi.listChallenges({
        search: search.trim() || undefined,
        difficulty: diff,
        minDuration,
        maxDuration,
      });

      setChallenges(data.challenges);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, [search, difficultyFilter, durationFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchChallenges();
    }, 250);
    return () => clearTimeout(handler);
  }, [fetchChallenges]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <Compass className="h-3.5 w-3.5" />
            <span>Structured Habit Formation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Digital Wellness Challenges
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Gentle, motivating multi-day protocols to reset screen habits, eliminate notification fatigue, and build deep work stamina.
          </p>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <Link to="/challenges/my">
              <Button variant="secondary" size="md" className="flex items-center gap-2 border-slate-700">
                <Flame className="h-4 w-4 text-emerald-400" />
                <span>My Active Challenges</span>
              </Button>
            </Link>
            <Link to="/achievements">
              <Button variant="secondary" size="md" className="flex items-center gap-2 border-slate-700">
                <Award className="h-4 w-4 text-amber-400" />
                <span>My Achievements</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 my-8">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search challenges (e.g. notifications, deep work, bedtime)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Difficulty Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-xs">
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                difficultyFilter === d
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d === 'ALL' ? 'All Levels' : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Duration Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'All Durations' },
            { id: 'SHORT', label: '1–5 Days' },
            { id: 'WEEK', label: '7 Days' },
            { id: 'LONG', label: '10+ Days' },
          ].map((dur) => (
            <button
              key={dur.id}
              onClick={() => setDurationFilter(dur.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                durationFilter === dur.id
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {dur.label}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-slate-800 bg-slate-900/40 p-6 h-64 animate-pulse">
              <div className="h-6 w-24 bg-slate-800 rounded mb-4" />
              <div className="h-6 w-3/4 bg-slate-800 rounded mb-2" />
              <div className="h-16 w-full bg-slate-800/60 rounded" />
            </Card>
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <Card className="border-slate-800 p-12 text-center my-6">
          <Compass className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No matching challenges found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing your difficulty/duration filters.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch('');
              setDifficultyFilter('ALL');
              setDurationFilter('ALL');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {challenges.map((c) => {
            const diff = DIFFICULTY_STYLES[c.difficulty] || DIFFICULTY_STYLES.BEGINNER;
            const isEnrolled = c.isEnrolled;

            return (
              <Card
                key={c.id}
                className="border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col justify-between p-6 group"
              >
                <div>
                  {/* Badges Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${diff.class}`}
                    >
                      {diff.label}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      {c.durationDays} Days
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div>
                  {/* Participant Count & Enrolled Status */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mb-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {c.enrollmentCount || 0} students enrolled
                    </span>

                    {isEnrolled && (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle className="h-3.5 w-3.5" /> Enrolled
                      </span>
                    )}
                  </div>

                  <Link to={`/challenges/${c.slug || c.id}`}>
                    <Button
                      variant={isEnrolled ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full flex items-center justify-center gap-1.5 font-bold"
                    >
                      <span>{isEnrolled ? 'View My Progress' : 'View Challenge Protocol'}</span>
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
  );
};
