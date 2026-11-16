import React from 'react';
import { Category, ResourceFilterState } from '../types/resource.types';
import { Search, RotateCcw, Filter, ShieldCheck } from 'lucide-react';

interface ResourceFiltersProps {
  filters: ResourceFilterState;
  categories: Category[];
  onChange: (updated: Partial<ResourceFilterState>) => void;
  onReset: () => void;
}

const PLATFORMS = [
  { label: 'All Platforms', value: '' },
  { label: 'Windows', value: 'WINDOWS' },
  { label: 'macOS', value: 'MACOS' },
  { label: 'Linux', value: 'LINUX' },
  { label: 'iOS', value: 'IOS' },
  { label: 'Android', value: 'ANDROID' },
  { label: 'Browser', value: 'BROWSER' },
];

const PRICING_MODELS = [
  { label: 'All Pricing', value: '' },
  { label: 'Free', value: 'FREE' },
  { label: 'Freemium', value: 'FREEMIUM' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Open Source', value: 'OPEN_SOURCE' },
];

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  filters,
  categories,
  onChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.category ||
      filters.platform ||
      filters.pricingModel ||
      filters.isVerified ||
      filters.sortBy !== 'createdAt'
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Search Bar & Reset */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources by title, keyword, or features..."
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Row: Category, Platform, Pricing, Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Category Selector */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Filter className="h-3 w-3 text-emerald-400" /> Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onChange({ category: e.target.value || undefined, page: 1 })}
            className="w-full py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name} {c._count?.resources ? `(${c._count.resources})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Selector */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Platform</label>
          <select
            value={filters.platform || ''}
            onChange={(e) => onChange({ platform: e.target.value || undefined, page: 1 })}
            className="w-full py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing Model */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Pricing Model</label>
          <select
            value={filters.pricingModel || ''}
            onChange={(e) => onChange({ pricingModel: e.target.value || undefined, page: 1 })}
            className="w-full py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {PRICING_MODELS.map((pm) => (
              <option key={pm.value} value={pm.value}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Sort By</label>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) =>
              onChange({
                sortBy: e.target.value as 'ratingAvg' | 'createdAt' | 'title',
                page: 1,
              })
            }
            className="w-full py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="createdAt">Recently Added</option>
            <option value="ratingAvg">Highest Rated</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Verified Only Toggle */}
      <div className="flex items-center gap-2 pt-1">
        <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(filters.isVerified)}
            onChange={(e) => onChange({ isVerified: e.target.checked ? true : undefined, page: 1 })}
            className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
          />
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Show verified tools only
          </span>
        </label>
      </div>
    </div>
  );
};
