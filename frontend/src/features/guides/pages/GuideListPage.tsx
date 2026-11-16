import React, { useEffect, useState, useCallback } from 'react';
import { guidesApi } from '../api/guidesApi';
import { DeviceGuide, GuideQueryParams } from '../types/guide.types';
import { GuideCard } from '../components/GuideCard';
import {
  BookOpen,
  Search,
  RotateCcw,
} from 'lucide-react';

const PLATFORM_TABS = [
  { label: 'All Devices', value: '' },
  { label: 'iOS / iPhone', value: 'IOS' },
  { label: 'Android', value: 'ANDROID' },
  { label: 'Windows', value: 'WINDOWS' },
  { label: 'macOS', value: 'MACOS' },
  { label: 'Browser', value: 'BROWSER' },
  { label: 'Linux', value: 'LINUX' },
];

export const GuideListPage: React.FC = () => {
  const [guides, setGuides] = useState<DeviceGuide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<GuideQueryParams>({
    platform: '',
    difficulty: '',
    search: '',
    page: 1,
    limit: 12,
  });

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await guidesApi.getGuides(filters);
      if (response.success) {
        setGuides(response.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load guides.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handlePlatformTab = (platform: string) => {
    setFilters((prev) => ({ ...prev, platform, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      platform: '',
      difficulty: '',
      search: '',
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-medium mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          Interactive Knowledge & Device Setup
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Device Configuration Guides
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
          Actionable, zero-fluff step-by-step instructions to configure your smartphone, computer,
          and browsers for distraction-free deep study.
        </p>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none mb-6">
        {PLATFORM_TABS.map((tab) => {
          const isActive = (filters.platform || '') === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handlePlatformTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Difficulty Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides by title or keyword..."
            value={filters.search || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.difficulty || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, difficulty: e.target.value, page: 1 }))
            }
            className="py-2 px-3 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner (1-5 min)</option>
            <option value="INTERMEDIATE">Intermediate (5-10 min)</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          {(filters.platform || filters.difficulty || filters.search) && (
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700/60 rounded-lg"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl border border-slate-800 bg-slate-900/40 p-5 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-800 rounded w-3/4" />
              <div className="h-10 bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-300">
          <p className="font-semibold text-base mb-2">Error Loading Guides</p>
          <p className="text-sm text-rose-400 mb-4">{error}</p>
          <button
            onClick={fetchGuides}
            className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 rounded-lg text-xs font-medium"
          >
            Retry
          </button>
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-slate-800/80 bg-slate-900/30">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No guides found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            We couldn't find any guides matching your criteria. Try selecting "All Devices".
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
};
