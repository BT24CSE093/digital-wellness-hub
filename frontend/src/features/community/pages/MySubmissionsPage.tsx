import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityApi } from '../api/communityApi';
import { UserSubmissionsSummary } from '../types/community.types';
import { Card } from '../../../components/ui/Card';
import {
  Users,
  MessageSquare,
  Flag,
  Sparkles,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending Review', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  APPROVED: { label: 'Approved & Added', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  RESOLVED: { label: 'Resolved', className: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  REJECTED: { label: 'Declined', className: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

export const MySubmissionsPage: React.FC = () => {
  const [data, setData] = useState<UserSubmissionsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityApi
      .getMySubmissions()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link
          to="/community"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Community Hub
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Your Contributions</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Submissions</h1>
            <p className="text-slate-400 text-sm mt-1">
              Track your suggested tools, feedback notes, and flagged content reports.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/community"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
            >
              Suggest Resource
            </Link>
            <Link
              to="/community/feedback"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/60 transition-colors"
            >
              Submit Feedback
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-sm text-slate-400">Loading your submissions...</p>
        </div>
      ) : !data || data.totalCount === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800/80 rounded-2xl">
          <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No submissions yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Have an app you love, found a bug, or spotted outdated info? Contribute to help fellow students!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Resource Suggestions */}
          <div>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Resource Suggestions ({data.suggestions.length})</span>
            </h2>
            {data.suggestions.length === 0 ? (
              <p className="text-xs text-slate-500">No resources suggested yet.</p>
            ) : (
              <div className="space-y-3">
                {data.suggestions.map((s) => {
                  const badge = STATUS_BADGES[s.status] || STATUS_BADGES.PENDING;
                  return (
                    <Card key={s.id} className="border-slate-800 bg-slate-900/50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white text-sm">{s.title}</h3>
                            <a
                              href={s.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-emerald-400"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{s.tagline}</p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      {s.adminNotes && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                          <span className="font-semibold text-emerald-400">Moderator Note: </span>
                          {s.adminNotes}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback Submissions */}
          <div>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Feedback & Bug Reports ({data.feedback.length})</span>
            </h2>
            {data.feedback.length === 0 ? (
              <p className="text-xs text-slate-500">No feedback entries submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {data.feedback.map((f) => {
                  const badge = STATUS_BADGES[f.status] || STATUS_BADGES.PENDING;
                  return (
                    <Card key={f.id} className="border-slate-800 bg-slate-900/50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold mr-2">
                            {f.type.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-white text-sm">{f.title}</span>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{f.details}</p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border self-start sm:self-auto ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      {f.adminNotes && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                          <span className="font-semibold text-emerald-400">Moderator Note: </span>
                          {f.adminNotes}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content Reports */}
          <div>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Flag className="h-4 w-4 text-emerald-400" />
              <span>Outdated Content Flags ({data.reports.length})</span>
            </h2>
            {data.reports.length === 0 ? (
              <p className="text-xs text-slate-500">No reports flagged.</p>
            ) : (
              <div className="space-y-3">
                {data.reports.map((r) => {
                  const badge = STATUS_BADGES[r.status] || STATUS_BADGES.PENDING;
                  return (
                    <Card key={r.id} className="border-slate-800 bg-slate-900/50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold mr-2">
                            {r.contentType}: {r.contentId}
                          </span>
                          <span className="font-semibold text-white text-sm">{r.reason}</span>
                          {r.details && <p className="text-xs text-slate-400 mt-1">{r.details}</p>}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border self-start sm:self-auto ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      {r.adminNotes && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                          <span className="font-semibold text-emerald-400">Moderator Note: </span>
                          {r.adminNotes}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
