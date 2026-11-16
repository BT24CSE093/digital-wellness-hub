import React from 'react';
import { Link } from 'react-router-dom';
import { DeviceGuide } from '../types/guide.types';
import {
  Clock,
  Smartphone,
  Monitor,
  Globe,
  ArrowRight,
  ListOrdered,
} from 'lucide-react';

interface GuideCardProps {
  guide: DeviceGuide;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60';
      case 'INTERMEDIATE':
        return 'bg-amber-950/70 text-amber-400 border-amber-800/60';
      case 'ADVANCED':
        return 'bg-rose-950/70 text-rose-400 border-rose-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'IOS':
      case 'ANDROID':
        return <Smartphone className="h-3.5 w-3.5 text-emerald-400" />;
      case 'BROWSER':
        return <Globe className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <Monitor className="h-3.5 w-3.5 text-emerald-400" />;
    }
  };

  const stepsCount = Array.isArray(guide.steps) ? guide.steps.length : 0;

  return (
    <Link
      to={`/guides/${guide.slug}`}
      className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-full">
            {getPlatformIcon(guide.platform)}
            <span>{guide.platform}</span>
          </span>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDifficultyBadge(
              guide.difficulty
            )}`}
          >
            {guide.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
          {guide.title}
        </h3>
      </div>

      {/* Meta Footer */}
      <div className="mt-6 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{guide.estimatedMinutes} min</span>
          </span>
          <span className="flex items-center gap-1">
            <ListOrdered className="h-3.5 w-3.5 text-slate-400" />
            <span>{stepsCount} steps</span>
          </span>
        </div>

        <span className="flex items-center gap-1 text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
          <span>Read</span>
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
};
