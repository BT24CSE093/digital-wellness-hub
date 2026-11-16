import React from 'react';
import { Link } from 'react-router-dom';
import { Resource } from '../types/resource.types';
import {
  ShieldCheck,
  Star,
  ExternalLink,
  Plus,
  Check,
  Smartphone,
  Monitor,
  Globe,
  Layers,
} from 'lucide-react';
import {
  isResourceInComparison,
  addComparisonId,
  removeComparisonId,
} from '../../comparison/utils/comparisonStorage';

interface ResourceCardProps {
  resource: Resource;
  onCompareChange?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onCompareChange }) => {
  const [inCompare, setInCompare] = React.useState<boolean>(isResourceInComparison(resource.id));
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleSync = () => {
      setInCompare(isResourceInComparison(resource.id));
    };
    window.addEventListener('dwh_comparison_updated', handleSync);
    return () => window.removeEventListener('dwh_comparison_updated', handleSync);
  }, [resource.id]);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (inCompare) {
      removeComparisonId(resource.id);
      setInCompare(false);
      onCompareChange?.();
    } else {
      const res = addComparisonId(resource.id);
      if (res.success) {
        setInCompare(true);
        onCompareChange?.();
      } else if (res.error) {
        setErrorMessage(res.error);
        setTimeout(() => setErrorMessage(null), 3000);
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

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700 transition-all duration-200">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-full truncate">
            <Layers className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="truncate">{resource.category?.name || 'General Tool'}</span>
          </span>

          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPricingBadge(
              resource.pricingModel
            )}`}
          >
            {resource.pricingModel.replace('_', ' ')}
          </span>
        </div>

        {/* Title & Verified Badge */}
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/resources/${resource.slug}`}
            className="text-lg font-semibold text-white hover:text-emerald-400 transition-colors line-clamp-1"
          >
            {resource.title}
          </Link>
          {resource.isVerified && (
            <span
              className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded shrink-0"
              title="Verified by Digital Wellness Hub staff"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium hidden sm:inline">Verified</span>
            </span>
          )}
        </div>

        {/* Tagline */}
        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {resource.tagline}
        </p>

        {/* Platforms Badges */}
        <div className="mt-4 flex flex-wrap gap-1.5 items-center">
          {resource.platforms.map((plat) => (
            <span
              key={plat}
              className="text-[10px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded flex items-center gap-1"
            >
              {plat === 'IOS' || plat === 'ANDROID' ? (
                <Smartphone className="h-2.5 w-2.5 text-slate-400" />
              ) : plat === 'BROWSER' ? (
                <Globe className="h-2.5 w-2.5 text-slate-400" />
              ) : (
                <Monitor className="h-2.5 w-2.5 text-slate-400" />
              )}
              {plat}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Area: Rating, Actions, and Error Notice */}
      <div className="mt-5 pt-3 border-t border-slate-800/60">
        {errorMessage && (
          <p className="text-[11px] text-amber-400 font-medium mb-2 transition-all">
            {errorMessage}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-slate-300">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-slate-200">
              {resource.ratingAvg > 0 ? resource.ratingAvg.toFixed(1) : 'New'}
            </span>
            {resource.ratingCount > 0 && (
              <span className="text-slate-500 text-[11px]">({resource.ratingCount})</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleCompare}
              className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                inCompare
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
              }`}
              title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
            >
              {inCompare ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              <span>{inCompare ? 'Comparing' : 'Compare'}</span>
            </button>

            <Link
              to={`/resources/${resource.slug}`}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>View</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
