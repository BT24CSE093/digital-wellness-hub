import React, { useState, useEffect, useCallback } from 'react';
import { challengesApi } from '../api/challengesApi';
import { Achievement, AchievementCategory } from '../types/challenge.types';
import { Card } from '../../../components/ui/Card';
import {
  Award,
  Sparkles,
  Clock,
  Smartphone,
  CheckSquare,
  ShieldCheck,
  Calendar,
  Flame,
  CheckCircle,
  Moon,
  TrendingDown,
  Compass,
} from 'lucide-react';

const CATEGORY_NAMES: Record<AchievementCategory, string> = {
  FOCUS: 'Focus Sprints',
  SCREEN_TIME: 'Screen Time',
  ASSESSMENT: 'Self-Assessment',
  PLANNER: 'Daily Planner',
  CHALLENGE: 'Habit Challenges',
};

// Icon resolver helper
function renderBadgeIcon(iconName: string, isUnlocked: boolean) {
  const iconClass = `h-6 w-6 ${isUnlocked ? 'text-amber-400' : 'text-slate-600'}`;
  switch (iconName) {
    case 'Clock':
      return <Clock className={iconClass} />;
    case 'Flame':
      return <Flame className={iconClass} />;
    case 'Smartphone':
      return <Smartphone className={iconClass} />;
    case 'TrendingDown':
      return <TrendingDown className={iconClass} />;
    case 'Sparkles':
      return <Sparkles className={iconClass} />;
    case 'ShieldCheck':
      return <ShieldCheck className={iconClass} />;
    case 'CheckSquare':
      return <CheckSquare className={iconClass} />;
    case 'Calendar':
      return <Calendar className={iconClass} />;
    case 'Moon':
      return <Moon className={iconClass} />;
    case 'Compass':
      return <Compass className={iconClass} />;
    case 'Award':
    default:
      return <Award className={iconClass} />;
  }
}

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAchievements = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await challengesApi.getAchievements();
      setAchievements(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const filtered = selectedCategory === 'ALL'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const overallPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Personal Milestone Badges</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Achievements Gallery</h1>
          <p className="text-slate-400 text-sm mt-1">
            Celebrating consistent, self-paced habits with zero peer competition or pressure.
          </p>
        </div>

        {/* Milestone Counter Pill */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Unlocked</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
            {overallPercentage}%
          </div>
        </div>
      </div>

      {/* Non-Competitive Philosophy Notice */}
      <div className="my-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
        <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
        <span>
          Achievements are calculated automatically from your verified deep work sprints, screen time awareness, and daily plans. No public leaderboards.
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 text-xs">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Badges ({totalCount})
        </button>

        {(['FOCUS', 'SCREEN_TIME', 'PLANNER', 'ASSESSMENT', 'CHALLENGE'] as AchievementCategory[]).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {CATEGORY_NAMES[cat]}
            </button>
          )
        )}
      </div>

      {/* Badges Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-500 text-sm">Loading achievements...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ach) => {
            const isUnlocked = ach.isUnlocked;

            return (
              <Card
                key={ach.id}
                className={`p-6 border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? 'bg-slate-900/60 border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
                        isUnlocked
                          ? 'bg-amber-500/10 border-amber-500/30 shadow-inner'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      {renderBadgeIcon(ach.badgeIcon, isUnlocked)}
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                        isUnlocked
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {isUnlocked ? 'Unlocked ✓' : 'In Progress'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">{ach.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{ach.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  {isUnlocked ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Milestone Achieved</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                        <span>Milestone Progress</span>
                        <span className="font-mono text-white font-bold">
                          {ach.progress} / {ach.maxProgress}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${ach.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
