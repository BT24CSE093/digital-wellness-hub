import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { communityApi } from '../api/communityApi';
import { FeedbackType, ReportContentType } from '../types/community.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  Flag,
} from 'lucide-react';

const FEEDBACK_TYPES: { value: FeedbackType; label: string; desc: string }[] = [
  { value: 'UI_UX_SUGGESTION', label: 'UI/UX Suggestion', desc: 'Design, layout, color contrast, or navigation enhancement' },
  { value: 'BUG_REPORT', label: 'Bug Report', desc: 'Broken functionality, error messages, or unexpected behavior' },
  { value: 'ACCESSIBILITY_ISSUE', label: 'Accessibility', desc: 'Screen reader, keyboard navigation, or legibility issues' },
  { value: 'CONTENT_CORRECTION', label: 'Content Correction', desc: 'Typo, outdated instructions, or incorrect facts' },
  { value: 'GENERAL_FEEDBACK', label: 'General Feedback', desc: 'General thoughts or praises for Digital Wellness Hub' },
];

export const FeedbackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'report'>('feedback');

  // Feedback State
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('UI_UX_SUGGESTION');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [pageUrl, setPageUrl] = useState('');

  // Report Outdated Content State
  const [reportType, setReportType] = useState<ReportContentType>('RESOURCE');
  const [contentId, setContentId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle || !feedbackDetails) {
      setErrorMsg('Title and details are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await communityApi.submitFeedback({
        type: feedbackType,
        title: feedbackTitle,
        details: feedbackDetails,
        pageUrl: pageUrl.trim() || undefined,
      });

      setSuccessMsg('Thank you for your feedback! The platform team will review it shortly.');
      setFeedbackTitle('');
      setFeedbackDetails('');
      setPageUrl('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId || !reportReason) {
      setErrorMsg('Content identifier and reason are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await communityApi.submitReport({
        contentType: reportType,
        contentId: contentId.trim(),
        reason: reportReason.trim(),
        details: reportDetails.trim() || undefined,
      });

      setSuccessMsg('Thank you for flagging this! We will inspect and update the content.');
      setContentId('');
      setReportReason('');
      setReportDetails('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      {/* Navigation & Header */}
      <div className="mb-6">
        <Link
          to="/community"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Community Hub
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Feedback & Issue Reports</h1>
            <p className="text-slate-400 text-sm mt-1">
              Help us refine Digital Wellness Hub by submitting feedback, bug reports, or flagging outdated resources.
            </p>
          </div>
          <Link
            to="/community/my-submissions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/60 transition-colors self-start sm:self-auto"
          >
            My Submissions
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-8">
        <button
          onClick={() => {
            setActiveTab('feedback');
            setSuccessMsg(null);
            setErrorMsg(null);
          }}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'feedback'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Platform Feedback
        </button>
        <button
          onClick={() => {
            setActiveTab('report');
            setSuccessMsg(null);
            setErrorMsg(null);
          }}
          className={`pb-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'report'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flag className="h-4 w-4" /> Report Outdated Resource/Guide
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {activeTab === 'feedback' ? (
        <Card className="border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <form onSubmit={handleSubmitFeedback} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Feedback Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEEDBACK_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFeedbackType(t.value)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      feedbackType === t.value
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold text-white">{t.label}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Summary / Headline *
              </label>
              <input
                type="text"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder="Brief summary of your suggestion or bug"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Relevant Page URL (Optional)
              </label>
              <input
                type="url"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://wellnesshub.edu/..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Details & Steps to Reproduce / Ideas *
              </label>
              <textarea
                rows={5}
                value={feedbackDetails}
                onChange={(e) => setFeedbackDetails(e.target.value)}
                placeholder="Please describe in detail what happened or how you would like to see this improved..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Submitting...' : 'Send Feedback'}</span>
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <form onSubmit={handleSubmitReport} className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                Found broken links, obsolete pricing, or outdated operating system steps? Let us know so we can update the knowledge base.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Content Type *
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportContentType)}
                  aria-label="Report content type"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="RESOURCE">Resource Directory Tool</option>
                  <option value="GUIDE">Device Setup Guide</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Resource or Guide Title / Slug / ID *
                </label>
                <input
                  type="text"
                  value={contentId}
                  onChange={(e) => setContentId(e.target.value)}
                  placeholder="e.g. Forest, or ios-screen-time-limits"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Issue Summary / Reason *
              </label>
              <input
                type="text"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="e.g. Pricing changed from free to subscription only, or broken download link"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                rows={4}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide link to new official pricing or clarify steps..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting}
                className="flex items-center gap-2"
              >
                <Flag className="h-4 w-4" />
                <span>{submitting ? 'Submitting Report...' : 'Submit Report'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
