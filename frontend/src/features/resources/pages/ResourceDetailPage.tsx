import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resourcesApi } from '../api/resourcesApi';
import { Resource } from '../types/resource.types';
import {
  isResourceInComparison,
  addComparisonId,
  removeComparisonId,
} from '../../comparison/utils/comparisonStorage';
import {
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronLeft,
  SlidersHorizontal,
  Check,
  Plus,
  Monitor,
  Smartphone,
  Globe,
  Tag,
  Calendar,
  Layers,
} from 'lucide-react';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inCompare, setInCompare] = useState<boolean>(false);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    resourcesApi
      .getResourceByIdOrSlug(id)
      .then((res) => {
        if (res.success && res.data) {
          setResource(res.data);
          setInCompare(isResourceInComparison(res.data.id));
        } else {
          setError('Resource not found');
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load resource details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleCompare = () => {
    if (!resource) return;
    setCompareNotice(null);
    if (inCompare) {
      removeComparisonId(resource.id);
      setInCompare(false);
    } else {
      const res = addComparisonId(resource.id);
      if (res.success) {
        setInCompare(true);
      } else if (res.error) {
        setCompareNotice(res.error);
        setTimeout(() => setCompareNotice(null), 3000);
      }
    }
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-28 mb-6" />
        <div className="h-10 bg-slate-800 rounded w-3/4 mb-4" />
        <div className="h-6 bg-slate-800/60 rounded w-1/2 mb-8" />
        <div className="h-48 bg-slate-900 rounded-xl mb-6" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-rose-400 mb-2">Resource Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          The requested tool could not be located in our verified directory.
        </p>
        <button
          onClick={() => navigate('/resources')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Resources Directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/resources" className="hover:text-emerald-400 transition-colors">
          Resources
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-medium truncate">{resource.title}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Category & Pricing Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-full">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                {resource.category?.name || 'Category'}
              </span>

              <span
                className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getPricingBadge(
                  resource.pricingModel
                )}`}
              >
                {resource.pricingModel.replace('_', ' ')}
              </span>

              {resource.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Directory Tool
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {resource.title}
            </h1>
            <p className="text-base text-slate-300 leading-relaxed font-normal">
              {resource.tagline}
            </p>

            {/* Ratings & Metadata */}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="font-bold text-sm text-slate-100">
                  {resource.ratingAvg > 0 ? resource.ratingAvg.toFixed(1) : 'New'}
                </span>
                <span className="text-slate-400">
                  ({resource.ratingCount} {resource.ratingCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Added {new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href={resource.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-950/50"
            >
              <span>Visit Official Site</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              onClick={handleToggleCompare}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                inCompare
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {inCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{inCompare ? 'In Comparison' : 'Add to Compare'}</span>
            </button>

            {inCompare && (
              <Link
                to="/compare"
                className="text-center text-xs text-emerald-400 hover:underline flex items-center justify-center gap-1 mt-1"
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>Open Comparison Matrix</span>
              </Link>
            )}

            {compareNotice && (
              <p className="text-xs text-amber-400 text-center font-medium max-w-[200px]">
                {compareNotice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Comprehensive Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-bold text-white mb-3">About {resource.title}</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {resource.description}
            </div>
          </div>

          {/* Student Reviews & Community Verification */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center justify-between">
              <span>Student Community Reviews</span>
              <span className="text-xs text-slate-400 font-normal">
                {resource.reviews?.length || 0} approved
              </span>
            </h2>

            {resource.reviews && resource.reviews.length > 0 ? (
              <div className="space-y-4">
                {resource.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        {rev.user.firstName} {rev.user.lastName}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    {rev.reviewText && (
                      <p className="text-xs text-slate-400 italic">"{rev.reviewText}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">
                No verified student reviews have been posted for this resource yet. Be the first to
                leave feedback once you test it in your academic routine.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Platform & Spec Breakdown */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Technical Specifications
            </h3>

            {/* Platforms */}
            <div>
              <span className="text-xs text-slate-400 block mb-2">Supported Platforms</span>
              <div className="flex flex-wrap gap-1.5">
                {resource.platforms.map((plat) => (
                  <span
                    key={plat}
                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-md"
                  >
                    {plat === 'IOS' || plat === 'ANDROID' ? (
                      <Smartphone className="h-3 w-3 text-emerald-400" />
                    ) : plat === 'BROWSER' ? (
                      <Globe className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Monitor className="h-3 w-3 text-emerald-400" />
                    )}
                    {plat}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing Model Details */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Pricing Model</span>
              <span className="text-sm font-semibold text-white">
                {resource.pricingModel === 'FREE' && '100% Free to use for students'}
                {resource.pricingModel === 'OPEN_SOURCE' && 'Open Source & Self-Hostable'}
                {resource.pricingModel === 'FREEMIUM' && 'Freemium (Free tier available)'}
                {resource.pricingModel === 'PAID' && 'Paid (Subscription or one-time license)'}
              </span>
            </div>

            {/* Category */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Hub Classification</span>
              <span className="text-sm text-slate-200 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-emerald-400" />
                {resource.category?.name}
              </span>
            </div>

            {/* Verification Info */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Staff Verification</span>
              {resource.isVerified ? (
                <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verified by Digital Wellness Hub</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Community submitted, pending staff verification</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
