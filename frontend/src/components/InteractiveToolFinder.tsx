import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import {
  ArrowRight,
  BookOpen,
  Smartphone,
  Laptop,
  Compass,
  RotateCcw,
} from 'lucide-react';

interface Recommendation {
  title: string;
  category: string;
  tagline: string;
  recommendedLink: string;
  guideLink: string;
  guideTitle: string;
}

const RECOMMENDATIONS: Record<string, Recommendation> = {
  notifications: {
    title: 'Native Notification Triage',
    category: 'Notification & Sleep Protocol',
    tagline: 'Batch alerts and schedule quiet hours to stop reactive phone checking.',
    recommendedLink: '/guides/ios-screen-time-limits',
    guideLink: '/guides/android-notification-management',
    guideTitle: 'Setup Scheduled Focus Modes',
  },
  social: {
    title: 'OneSec / Mindful Pause',
    category: 'App & Habit Blockers',
    tagline: 'Breaks compulsive phone opening loops by forcing a mindful breath before launch.',
    recommendedLink: '/resources',
    guideLink: '/guides/ios-scheduled-grayscale',
    guideTitle: 'Enable Grayscale Color Filters',
  },
  study: {
    title: 'Pomodoro Deep Work Sprint',
    category: 'Focus & Study Flow',
    tagline: 'Work in 25-minute protected blocks paired with intentional reflection.',
    recommendedLink: '/focus',
    guideLink: '/guides/windows-night-light-focus',
    guideTitle: 'Windows Focus Assist Setup',
  },
  bedtime: {
    title: 'Digital Sunset Ritual',
    category: 'Sleep & Blue Light Protocol',
    tagline: 'Eliminate stimulating blue-light and notifications 60 minutes before sleep.',
    recommendedLink: '/challenges',
    guideLink: '/guides/macos-focus-filters',
    guideTitle: 'Mac Scheduled Downtime',
  },
};

export const InteractiveToolFinder: React.FC = () => {
  const [distraction, setDistraction] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);

  const currentRec = distraction ? RECOMMENDATIONS[distraction] : null;

  const handleReset = () => {
    setDistraction(null);
    setPlatform(null);
  };

  return (
    <Card className="bg-[#161b22] border border-[#30363d] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Compass className="h-3.5 w-3.5" />
            <span>Interactive Tool & Guide Finder</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            What is your biggest digital hurdle right now?
          </h2>
          <p className="text-[#8b949e] text-xs sm:text-sm mt-1">
            Answer 2 quick questions to get the exact verified tool and native setup guide.
          </p>
        </div>

        {(distraction || platform) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Step 1: Select Main Distraction */}
      <div className="space-y-3 mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
          Step 1: Where do you lose the most study time?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'notifications', label: 'Constant Notifications', icon: '🔔' },
            { id: 'social', label: 'Compulsive Reels / Feeds', icon: '📱' },
            { id: 'study', label: 'Can’t Start or Stay in Flow', icon: '⏳' },
            { id: 'bedtime', label: 'Late Night Screen Fatigue', icon: '🌙' },
          ].map((item) => {
            const isSelected = distraction === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDistraction(item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                    : 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]'
                }`}
              >
                <span className="text-xl mb-1.5">{item.icon}</span>
                <span className="text-xs font-semibold leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Select Main Device */}
      {distraction && (
        <div className="space-y-3 mb-6 animate-fade-in">
          <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
            Step 2: What is your primary device?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'ios', label: 'iPhone / iPad (iOS)', icon: <Smartphone className="h-4 w-4" /> },
              { id: 'android', label: 'Android Phone', icon: <Smartphone className="h-4 w-4" /> },
              { id: 'macos', label: 'MacBook (macOS)', icon: <Laptop className="h-4 w-4" /> },
              { id: 'windows', label: 'Windows PC / Laptop', icon: <Laptop className="h-4 w-4" /> },
            ].map((p) => {
              const isSelected = platform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-semibold ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-white'
                  }`}
                >
                  <span className={isSelected ? 'text-emerald-400' : 'text-[#8b949e]'}>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Instant Recommendation Card */}
      {currentRec && (
        <div className="mt-6 p-5 rounded-xl bg-[#0d1117] border border-[#30363d] animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Recommended Solution
              </span>
              <h3 className="text-base font-bold text-white mt-1">{currentRec.title}</h3>
              <p className="text-xs text-[#8b949e] mt-1 max-w-xl leading-relaxed">{currentRec.tagline}</p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <Link to={currentRec.recommendedLink}>
                <Button size="sm" variant="primary" className="flex items-center gap-1.5 shadow-xs">
                  <span>Start Tool</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to={currentRec.guideLink}>
                <Button size="sm" variant="secondary" className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#8b949e]" />
                  <span>Setup Guide</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
