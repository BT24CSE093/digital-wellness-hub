import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityApi } from '../api/communityApi';
import {
  ResourceSuggestion,
  FeedbackSubmission,
  ContentReport,
  SubmissionStatus,
} from '../types/community.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Flag,
  ArrowLeft,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

export const AdminCommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'feedback' | 'reports'>('suggestions');

  const [suggestions, setSuggestions] = useState<ResourceSuggestion[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackSubmission[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Note Modal / Action state
  const [modalItem, setModalItem] = useState<{
    id: string;
    type: 'suggestions' | 'feedback' | 'reports';
    action: SubmissionStatus;
  } | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sug, feed, rep] = await Promise.all([
        communityApi.listAdminSuggestions(),
        communityApi.listAdminFeedback(),
        communityApi.listAdminReports(),
      ]);
      setSuggestions(sug);
      setFeedbackList(feed);
      setReports(rep);
    } catch (err) {
      console.error('Failed to load community admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleModerate = async () => {
    if (!modalItem) return;
    setActionLoading(true);
    try {
      if (modalItem.type === 'suggestions') {
        await communityApi.moderateSuggestion(modalItem.id, modalItem.action, adminNotes);
      } else if (modalItem.type === 'feedback') {
        await communityApi.moderateFeedback(modalItem.id, modalItem.action, adminNotes);
      } else {
        await communityApi.moderateReport(modalItem.id, modalItem.action, adminNotes);
      }
      setModalItem(null);
      setAdminNotes('');
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Moderation action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      {/* Navigation & Header */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Panel
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Moderation Queue</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Community & Feedback Governance</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review student resource suggestions, convert them into official directory entries, and manage feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'suggestions'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" /> Resource Suggestions ({suggestions.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Feedback & Bugs ({feedbackList.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flag className="h-4 w-4" /> Outdated Content Reports ({reports.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-sm text-slate-400">Loading moderation records...</p>
        </div>
      ) : activeTab === 'suggestions' ? (
        suggestions.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 text-center">No resource suggestions in queue.</p>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s) => (
              <Card key={s.id} className="border-slate-800 bg-slate-900/50 p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white text-base">{s.title}</h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {s.pricingModel}
                      </span>
                      <a
                        href={s.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline text-xs flex items-center gap-1"
                      >
                        Visit Site <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{s.tagline}</p>
                    <p className="text-xs text-slate-400 mt-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                      {s.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                      <span>Submitted by: {s.user?.firstName} {s.user?.lastName} ({s.user?.email})</span>
                      <span>Platforms: {s.platforms.join(', ')}</span>
                      <span>Status: <strong className="text-emerald-400">{s.status}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {s.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setModalItem({ id: s.id, type: 'suggestions', action: 'APPROVED' });
                            setAdminNotes('Approved and converted to verified directory resource.');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve & Convert
                        </button>
                        <button
                          onClick={() => {
                            setModalItem({ id: s.id, type: 'suggestions', action: 'REJECTED' });
                            setAdminNotes('');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" /> Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : activeTab === 'feedback' ? (
        feedbackList.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 text-center">No feedback entries.</p>
        ) : (
          <div className="space-y-4">
            {feedbackList.map((f) => (
              <Card key={f.id} className="border-slate-800 bg-slate-900/50 p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold">
                        {f.type.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-white text-sm">{f.title}</h3>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                      {f.details}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                      <span>Submitted by: {f.user?.firstName} {f.user?.lastName} ({f.user?.email})</span>
                      {f.pageUrl && <span>URL: {f.pageUrl}</span>}
                      <span>Status: <strong className="text-emerald-400">{f.status}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {f.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setModalItem({ id: f.id, type: 'feedback', action: 'RESOLVED' });
                          setAdminNotes('Reviewed and addressed.');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : reports.length === 0 ? (
        <p className="text-slate-500 text-sm py-8 text-center">No content reports flagged.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r.id} className="border-slate-800 bg-slate-900/50 p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30 font-semibold">
                      {r.contentType}: {r.contentId}
                    </span>
                    <h3 className="font-bold text-white text-sm">{r.reason}</h3>
                  </div>
                  {r.details && (
                    <p className="text-xs text-slate-300 mt-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                      {r.details}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                    <span>Reported by: {r.user?.firstName} {r.user?.lastName} ({r.user?.email})</span>
                    <span>Status: <strong className="text-emerald-400">{r.status}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {r.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setModalItem({ id: r.id, type: 'reports', action: 'RESOLVED' });
                        setAdminNotes('Content inspected and updated.');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Confirm Moderation: {modalItem.action}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add an optional administrative note that will be visible to the submitting student.
            </p>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Thanks for your contribution! Now live in directory."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalItem(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleModerate}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm Action'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
