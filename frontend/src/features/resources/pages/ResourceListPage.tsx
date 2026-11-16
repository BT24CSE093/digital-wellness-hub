import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { resourcesApi } from '../api/resourcesApi';
import {
  Resource,
  Category,
  ResourceFilterState,
  PaginatedResourcesResponse,
} from '../types/resource.types';
import { ResourceCard } from '../components/ResourceCard';
import { ResourceFilters } from '../components/ResourceFilters';
import {
  getComparisonIds,
  clearComparison,
  MAX_COMPARE_ITEMS,
} from '../../comparison/utils/comparisonStorage';
import {
  Layers,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';

export const ResourceListPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ResourceFilterState>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  const [compareCount, setCompareCount] = useState<number>(getComparisonIds().length);

  // Sync comparison count
  useEffect(() => {
    const handleSync = () => {
      setCompareCount(getComparisonIds().length);
    };
    window.addEventListener('dwh_comparison_updated', handleSync);
    return () => window.removeEventListener('dwh_comparison_updated', handleSync);
  }, []);

  // Fetch categories once
  useEffect(() => {
    resourcesApi
      .getCategories()
      .then((res) => {
        if (res.success) setCategories(res.data);
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch resources when filters change
  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedResourcesResponse = await resourcesApi.getResources(filters);
      if (response.success) {
        setResources(response.data);
        setPaginationMeta(response.meta);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleFilterChange = (updated: Partial<ResourceFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-medium mb-3">
            <Compass className="h-3.5 w-3.5" />
            Curated Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Digital Wellness Resources
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
            Explore verified tools, application blockers, mindful note editors, and sleep aids designed
            to help students reclaim attention and build intentional study habits.
          </p>
        </div>

        {/* Quick Link to Comparison */}
        {compareCount > 0 && (
          <Link
            to="/compare"
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Compare Selected ({compareCount}/{MAX_COMPARE_ITEMS})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Filter Component */}
      <ResourceFilters
        filters={filters}
        categories={categories}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl border border-slate-800 bg-slate-900/40 p-5 animate-pulse space-y-4"
              >
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-16 bg-slate-800/60 rounded" />
                <div className="h-6 bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-300">
            <p className="font-semibold text-base mb-2">Error Loading Resources</p>
            <p className="text-sm text-rose-400 mb-4">{error}</p>
            <button
              onClick={fetchResources}
              className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 rounded-lg text-xs font-medium text-rose-200"
            >
              Retry
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-xl border border-slate-800/80 bg-slate-900/30">
            <Layers className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No resources found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              We couldn't find any resources matching your active filters. Try broadening your criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  onCompareChange={() => setCompareCount(getComparisonIds().length)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {paginationMeta.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-slate-800/80 pt-6">
                <span className="text-xs text-slate-400">
                  Showing {(paginationMeta.page - 1) * paginationMeta.limit + 1} to{' '}
                  {Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.total)} of{' '}
                  {paginationMeta.total} tools
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={paginationMeta.page <= 1}
                    onClick={() => handleFilterChange({ page: paginationMeta.page - 1 })}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-medium text-slate-300 px-3">
                    Page {paginationMeta.page} of {paginationMeta.totalPages}
                  </span>
                  <button
                    disabled={paginationMeta.page >= paginationMeta.totalPages}
                    onClick={() => handleFilterChange({ page: paginationMeta.page + 1 })}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Compare Action Bar at Bottom of Screen */}
      {compareCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-emerald-500/40 backdrop-blur-lg px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 transition-all">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white">
              {compareCount} of {MAX_COMPARE_ITEMS} items selected for comparison
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/compare"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Compare Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => {
                clearComparison();
                setCompareCount(0);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear comparison selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
