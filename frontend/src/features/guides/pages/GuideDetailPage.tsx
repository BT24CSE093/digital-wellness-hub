import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { guidesApi } from '../api/guidesApi';
import { DeviceGuide, GuideStep } from '../types/guide.types';
import {
  ChevronLeft,
  Clock,
  CheckCircle2,
  Circle,
  Lightbulb,
  AlertTriangle,
  Smartphone,
  Monitor,
  Globe,
  User,
} from 'lucide-react';

export const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [guide, setGuide] = useState<DeviceGuide | null>(null);
  const [relatedGuides, setRelatedGuides] = useState<DeviceGuide[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setCompletedSteps([]);
    guidesApi
      .getGuideBySlug(slug)
      .then((res) => {
        if (res.success && res.data) {
          setGuide(res.data.guide);
          setRelatedGuides(res.data.relatedGuides || []);
        } else {
          setError('Guide not found');
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load guide.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-28 mb-6" />
        <div className="h-10 bg-slate-800 rounded w-3/4 mb-4" />
        <div className="h-40 bg-slate-900 rounded-xl mb-6" />
        <div className="space-y-4">
          <div className="h-28 bg-slate-900/60 rounded-xl" />
          <div className="h-28 bg-slate-900/60 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-rose-400 mb-2">Guide Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          The requested device guide could not be found or has not yet been published.
        </p>
        <button
          onClick={() => navigate('/guides')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to All Guides</span>
        </button>
      </div>
    );
  }

  const steps: GuideStep[] = Array.isArray(guide.steps) ? guide.steps : [];
  const percentDone = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/guides" className="hover:text-emerald-400 transition-colors">
          Guides
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-medium truncate">{guide.title}</span>
      </nav>

      {/* Hero Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-full">
            {guide.platform === 'IOS' || guide.platform === 'ANDROID' ? (
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
            ) : guide.platform === 'BROWSER' ? (
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Monitor className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>{guide.platform}</span>
          </span>

          <span
            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getDifficultyBadge(
              guide.difficulty
            )}`}
          >
            {guide.difficulty}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
          {guide.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Estimated setup time: {guide.estimatedMinutes} minutes</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Author: {guide.author?.firstName || 'System'} {guide.author?.lastName || 'Staff'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Progress Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 mb-8">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300">Configuration Progress</span>
          <span className="text-emerald-400 font-bold">
            {completedSteps.length} of {steps.length} steps completed ({percentDone}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentDone}%` }}
          />
        </div>
      </div>

      {/* Step by Step List */}
      <div className="space-y-6">
        {steps.map((step) => {
          const isDone = completedSteps.includes(step.stepNumber);
          return (
            <div
              key={step.stepNumber}
              className={`rounded-xl border transition-all p-5 sm:p-6 ${
                isDone
                  ? 'border-emerald-800/50 bg-emerald-950/10'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox / Step Number */}
                <button
                  onClick={() => toggleStep(step.stepNumber)}
                  className="mt-0.5 shrink-0 focus:outline-none"
                  title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 fill-emerald-950" />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-600 hover:text-slate-400" />
                  )}
                </button>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Step {step.stepNumber}
                    </span>
                    {isDone && (
                      <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                        Completed
                      </span>
                    )}
                  </div>

                  <h3 className={`text-lg font-bold ${isDone ? 'text-slate-300' : 'text-white'}`}>
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    {step.instruction}
                  </p>

                  {/* Optional Tip Callout */}
                  {step.tip && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs">
                      <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-semibold block mb-0.5">Pro Tip</span>
                        {step.tip}
                      </div>
                    </div>
                  )}

                  {/* Optional Warning Callout */}
                  {step.warning && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-300 text-xs">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-semibold block mb-0.5">Important Warning</span>
                        {step.warning}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {percentDone === 100 && (
        <div className="mt-8 p-6 rounded-2xl border border-emerald-500/50 bg-emerald-950/30 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Device Configuration Complete!</h3>
          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-md mx-auto">
            You have configured this device setting. Monitor your attention and screen time to see how
            it impacts your daily study flow.
          </p>
        </div>
      )}

      {/* Related Guides Section */}
      {relatedGuides.length > 0 && (
        <div className="mt-14 pt-8 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6">
            More {guide.platform} Configuration Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedGuides.map((rel) => (
              <Link
                key={rel.id}
                to={`/guides/${rel.slug}`}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80 transition-all block group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{rel.platform}</span>
                  <span>{rel.estimatedMinutes} min</span>
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {rel.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
