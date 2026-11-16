import React, { useState, useEffect, useCallback } from 'react';
import { wellnessApi } from '../api/wellnessApi';
import {
  WellnessAssessment,
  AssessmentResponse,
  WellnessDimension,
  WellnessTier,
} from '../types/wellness.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Sparkles,
  CheckCircle,
  HelpCircle,
  Award,
  Calendar,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface Question {
  id: string;
  dimensionId: WellnessDimension;
  text: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  // 1. Screen-Time Awareness
  {
    id: 'sta_1',
    dimensionId: 'screenTimeAwareness',
    text: 'I am consciously aware of how much time I spend looking at screens each day.',
  },
  {
    id: 'sta_2',
    dimensionId: 'screenTimeAwareness',
    text: 'I regularly check my device screen-time metrics to evaluate my daily digital habits.',
  },
  // 2. Focus Behavior
  {
    id: 'fb_1',
    dimensionId: 'focusBehavior',
    text: 'I can engage in uninterrupted study or deep work for 25+ minutes without compulsively checking my phone.',
  },
  {
    id: 'fb_2',
    dimensionId: 'focusBehavior',
    text: 'I avoid switching between multiple tabs, feeds, or messaging apps while trying to complete an assignment.',
  },
  // 3. Device Habits
  {
    id: 'dh_1',
    dimensionId: 'deviceHabits',
    text: 'I keep non-urgent notifications disabled or utilize Focus/Do-Not-Disturb modes when working.',
  },
  {
    id: 'dh_2',
    dimensionId: 'deviceHabits',
    text: 'My home screen is intentionally arranged to minimize distracting algorithmic feeds.',
  },
  // 4. Sleep & Restoration
  {
    id: 'sr_1',
    dimensionId: 'sleepAndRestoration',
    text: 'I put away phones, laptops, and tablets at least 30 minutes before trying to fall asleep.',
  },
  {
    id: 'sr_2',
    dimensionId: 'sleepAndRestoration',
    text: 'My phone is charged away from my bed, preventing late-night or first-thing-in-the-morning doomscrolling.',
  },
  // 5. Social & Digital Balance
  {
    id: 'sb_1',
    dimensionId: 'socialDigitalBalance',
    text: 'When spending time with friends or family, I keep my phone tucked away and stay present in the moment.',
  },
  {
    id: 'sb_2',
    dimensionId: 'socialDigitalBalance',
    text: 'I regularly engage in offline, screen-free hobbies (such as reading, walking, cooking, or sports).',
  },
];

const TIER_BADGES: Record<WellnessTier, { label: string; bg: string; text: string; border: string }> = {
  OPTIMAL: { label: 'Optimal Digital Balance', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  BALANCED: { label: 'Balanced Habits', bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  MODERATE: { label: 'Moderate Screen Fatigue', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  CRITICAL: { label: 'Attention Overload Risk', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
};

const DIMENSION_TITLES: Record<WellnessDimension, string> = {
  screenTimeAwareness: 'Screen-Time Awareness',
  focusBehavior: 'Deep Focus & Flow',
  deviceHabits: 'Notification Boundaries',
  sleepAndRestoration: 'Sleep Hygiene & Digital Sunset',
  socialDigitalBalance: 'Real-World Social Balance',
};

export const AssessmentPage: React.FC = () => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [latestAssessment, setLatestAssessment] = useState<WellnessAssessment | null>(null);
  const [history, setHistory] = useState<WellnessAssessment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'questionnaire' | 'result'>('result');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [latest, list] = await Promise.all([
        wellnessApi.getLatestAssessment(),
        wellnessApi.getAssessmentHistory(),
      ]);
      setLatestAssessment(latest);
      setHistory(list);
      if (!latest) {
        setViewMode('questionnaire');
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectScore = (questionId: string, score: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: score }));
  };

  const answeredCount = Object.keys(responses).length;
  const isComplete = answeredCount === ASSESSMENT_QUESTIONS.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      alert('Please answer all 10 reflection questions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: AssessmentResponse[] = ASSESSMENT_QUESTIONS.map((q) => ({
        questionId: q.id,
        dimensionId: q.dimensionId,
        score: responses[q.id] || 3,
      }));

      const result = await wellnessApi.submitAssessment(payload);
      setLatestAssessment(result);
      setViewMode('result');
      loadData();
    } catch {
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Reflective Self-Assessment</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Digital Wellness Assessment
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Evaluate your digital environment, attention boundaries, and sleep habits.
          </p>
        </div>

        {viewMode === 'result' ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setResponses({});
              setViewMode('questionnaire');
            }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake Assessment</span>
          </Button>
        ) : (
          latestAssessment && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setViewMode('result')}
              className="flex items-center gap-2"
            >
              <span>View Latest Results</span>
            </Button>
          )
        )}
      </div>

      {/* Non-Diagnostic Educational Notice */}
      <div className="my-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">Non-Diagnostic Educational Tool</p>
          <p className="mt-0.5">
            This assessment is designed for self-reflection and educational habit formation. It does not diagnose clinical addiction, depression, or anxiety.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-500">Loading assessment...</div>
      ) : viewMode === 'questionnaire' ? (
        /* QUESTIONNAIRE FORM */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Progress: {answeredCount} / {ASSESSMENT_QUESTIONS.length} Questions Answered</span>
            <span className="font-mono">{Math.round((answeredCount / ASSESSMENT_QUESTIONS.length) * 100)}%</span>
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-6">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(answeredCount / ASSESSMENT_QUESTIONS.length) * 100}%` }}
            />
          </div>

          <div className="space-y-4">
            {ASSESSMENT_QUESTIONS.map((q, idx) => {
              const currentScore = responses[q.id];
              return (
                <Card key={q.id} className="border-slate-800 bg-slate-900/40 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      {DIMENSION_TITLES[q.dimensionId]}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
                  </div>

                  <p className="text-sm text-slate-100 font-medium mb-4">{q.text}</p>

                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = currentScore === val;
                      const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectScore(q.id, val)}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <span className="font-bold text-sm">{val}</span>
                          <span className="text-[10px] hidden sm:block truncate">{labels[val - 1]}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={!isComplete || isSubmitting}
              className="px-8 font-bold"
            >
              {isSubmitting ? 'Calculating...' : 'Submit Self-Assessment'}
            </Button>
          </div>
        </form>
      ) : latestAssessment ? (
        /* RESULTS VIEW */
        <div className="space-y-8">
          {/* Main Score & Tier Banner */}
          <Card className="border-slate-800 bg-slate-900/60 p-8 text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              <Award className="h-4 w-4" />
              <span>Assessment Completed {new Date(latestAssessment.completedAt).toLocaleDateString()}</span>
            </div>

            <div className="my-4">
              <span className="text-6xl font-black text-white font-mono tracking-tight">
                {latestAssessment.overallScore}
              </span>
              <span className="text-xl text-slate-500 font-bold ml-1">/ 100</span>
            </div>

            <div className="inline-block mt-2">
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                  TIER_BADGES[latestAssessment.calculatedTier].bg
                } ${TIER_BADGES[latestAssessment.calculatedTier].text} ${
                  TIER_BADGES[latestAssessment.calculatedTier].border
                }`}
              >
                {TIER_BADGES[latestAssessment.calculatedTier].label}
              </span>
            </div>
          </Card>

          {/* Dimension Breakdown Grid */}
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-cyan-400" /> Five Dimension Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(latestAssessment.dimensionScores || {}).map(([dimKey, score]) => {
                const title = DIMENSION_TITLES[dimKey as WellnessDimension] || dimKey;
                return (
                  <Card key={dimKey} className="border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-200">{title}</span>
                      <span className="font-mono font-bold text-white">{score}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score >= 70 ? 'bg-emerald-400' : score >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> Actionable Habit Suggestions
            </h2>

            <div className="space-y-3">
              {(latestAssessment.recommendations || []).map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Assessments */}
          {history.length > 1 && (
            <div className="pt-6 border-t border-slate-800">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" /> Assessment History
              </h2>

              <div className="space-y-2">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-400 font-mono">
                      {new Date(h.completedAt).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-white font-mono">{h.overallScore}/100</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        TIER_BADGES[h.calculatedTier].bg
                      } ${TIER_BADGES[h.calculatedTier].text} ${TIER_BADGES[h.calculatedTier].border}`}
                    >
                      {h.calculatedTier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-slate-800 p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-semibold">No assessment taken yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Take 3 minutes to evaluate your attention span and digital habits.
          </p>
          <Button variant="primary" size="md" onClick={() => setViewMode('questionnaire')}>
            Start Assessment
          </Button>
        </Card>
      )}
    </div>
  );
};
