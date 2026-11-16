import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourcesApi } from '../../resources/api/resourcesApi';
import { Resource } from '../../resources/types/resource.types';
import {
  getComparisonIds,
  removeComparisonId,
  clearComparison,
  MAX_COMPARE_ITEMS,
} from '../utils/comparisonStorage';
import {
  SlidersHorizontal,
  X,
  Trash2,
  ShieldCheck,
  Star,
  ExternalLink,
  Plus,
  ArrowRight,
  Smartphone,
  Monitor,
  Globe,
  AlertCircle,
} from 'lucide-react';

export const ResourceComparePage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadResources = async () => {
    const ids = getComparisonIds();
    if (ids.length === 0) {
      setResources([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const promises = ids.map((id) => resourcesApi.getResourceByIdOrSlug(id));
      const results = await Promise.all(promises);
      const items = results.map((r) => r.data).filter(Boolean);
      setResources(items);
    } catch (err: any) {
      setError(err?.message || 'Failed to load compared resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();

    const handleSync = () => {
      loadResources();
    };
    window.addEventListener('dwh_comparison_updated', handleSync);
    return () => window.removeEventListener('dwh_comparison_updated', handleSync);
  }, []);

  const handleRemove = (id: string) => {
    removeComparisonId(id);
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    clearComparison();
    setResources([]);
  };

  const getPricingBadge = (model: string) => {
    switch (model) {
      case 'FREE':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60';
      case 'FREEMIUM':
        return 'bg-blue-950/70 text-blue-400 border-blue-800/60';
      case 'PAID':
        return 'bg-purple-950/70 text-purple-400 border-purple-800/60';
      case 'OPEN_SOURCE':
        return 'bg-amber-950/70 text-amber-400 border-amber-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-medium mb-3">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Direct Comparison Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Resource Comparison Matrix
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
            Side-by-side technical, pricing, and platform evaluation to help you choose the right
            digital wellness tools for your devices and study habits.
          </p>
        </div>

        {resources.length > 0 && (
          <div className="flex items-center gap-3">
            {resources.length < MAX_COMPARE_ITEMS && (
              <Link
                to="/resources"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Tool ({resources.length}/{MAX_COMPARE_ITEMS})</span>
              </Link>
            )}

            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-medium border border-rose-800/60 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="h-64 rounded-xl border border-slate-800 bg-slate-900/40 p-8 flex items-center justify-center animate-pulse text-slate-400">
          Loading comparison matrix...
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-300">
          <p className="font-semibold">{error}</p>
          <button
            onClick={loadResources}
            className="mt-4 px-4 py-2 bg-rose-900/60 rounded-lg text-xs font-medium"
          >
            Retry
          </button>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl border border-slate-800 bg-slate-900/30 max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mx-auto">
            <SlidersHorizontal className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Your comparison list is empty</h2>
          <p className="text-sm text-slate-400">
            Select up to {MAX_COMPARE_ITEMS} tools from the resources library to contrast their
            pricing, platforms, and verification status side by side.
          </p>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-md shadow-emerald-950/50"
          >
            <span>Browse Digital Wellness Resources</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {resources.length === 1 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-300 text-xs">
              <AlertCircle className="h-4 w-4 text-blue-400 shrink-0" />
              <span>
                You currently have 1 tool selected. Add at least 1 more tool from the directory to
                contrast features side by side.
              </span>
              <Link
                to="/resources"
                className="ml-auto font-semibold text-emerald-400 hover:underline shrink-0"
              >
                + Add another tool
              </Link>
            </div>
          )}

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 w-1/4">
                    Comparison Metric
                  </th>
                  {resources.map((item) => (
                    <th key={item.id} className="py-5 px-6 align-top">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-medium text-slate-400 block mb-1">
                            {item.category?.name}
                          </span>
                          <Link
                            to={`/resources/${item.slug}`}
                            className="text-lg font-bold text-white hover:text-emerald-400 transition-colors"
                          >
                            {item.title}
                          </Link>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title={`Remove ${item.title} from comparison`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                {/* Pricing Model */}
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-400 bg-slate-950/30">
                    Pricing Model
                  </td>
                  {resources.map((item) => (
                    <td key={item.id} className="py-4 px-6">
                      <span
                        className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getPricingBadge(
                          item.pricingModel
                        )}`}
                      >
                        {item.pricingModel.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Platforms */}
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-400 bg-slate-950/30">
                    Platform Compatibility
                  </td>
                  {resources.map((item) => (
                    <td key={item.id} className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {item.platforms.map((plat) => (
                          <span
                            key={plat}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded"
                          >
                            {plat === 'IOS' || plat === 'ANDROID' ? (
                              <Smartphone className="h-3 w-3 text-slate-400" />
                            ) : plat === 'BROWSER' ? (
                              <Globe className="h-3 w-3 text-slate-400" />
                            ) : (
                              <Monitor className="h-3 w-3 text-slate-400" />
                            )}
                            {plat}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Hub Staff Verification */}
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-400 bg-slate-950/30">
                    Staff Verification
                  </td>
                  {resources.map((item) => (
                    <td key={item.id} className="py-4 px-6">
                      {item.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-full">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Pending Review</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-400 bg-slate-950/30">
                    Rating & Reviews
                  </td>
                  {resources.map((item) => (
                    <td key={item.id} className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span>{item.ratingAvg > 0 ? item.ratingAvg.toFixed(1) : 'New'}</span>
                        <span className="text-slate-500 text-xs">
                          ({item.ratingCount} {item.ratingCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Tagline */}
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-400 bg-slate-950/30">
                    Core Focus
                  </td>
                  {resources.map((item) => (
                    <td key={item.id} className="py-4 px-6 text-slate-300 font-medium">
                      {item.tagline}
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-400 bg-slate-950/30 align-top">
                    Summary & Highlights
                  </td>
                  {resources.map((item) => (
                    <td key={item.id} className="py-4 px-6 text-slate-400 text-xs leading-relaxed">
                      {item.description}
                    </td>
                  ))}
                </tr>

                {/* Action Links */}
                <tr>
                  <td className="py-5 px-6 font-semibold text-slate-400 bg-slate-950/30">
                    Actions
                  </td>
                  {resources.map((item) => (
                    <td key={item.id} className="py-5 px-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <a
                          href={item.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
                        >
                          <span>Official Site</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <Link
                          to={`/resources/${item.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                        >
                          <span>Details</span>
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
