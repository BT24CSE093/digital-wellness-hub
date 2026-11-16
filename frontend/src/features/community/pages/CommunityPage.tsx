import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { communityApi } from '../api/communityApi';
import { resourcesApi } from '../../resources/api/resourcesApi';
import { Category } from '../../resources/types/resource.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Users,
  PlusCircle,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const PRICING_OPTIONS = ['FREE', 'FREEMIUM', 'PAID', 'OPEN_SOURCE'];
const AVAILABLE_PLATFORMS = ['IOS', 'ANDROID', 'MACOS', 'WINDOWS', 'LINUX', 'BROWSER'];

export const CommunityPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState<boolean>(true);

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pricingModel, setPricingModel] = useState('FREEMIUM');
  const [platforms, setPlatforms] = useState<string[]>(['IOS', 'ANDROID']);
  const [categoryId, setCategoryId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    resourcesApi.getCategories().then((res) => {
      if (res.success && res.data.length > 0) {
        setCategories(res.data);
        setCategoryId(res.data[0].id);
      }
      setLoadingCats(false);
    });
  }, []);

  const handleTogglePlatform = (p: string) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tagline || !description || !websiteUrl || !categoryId) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (platforms.length === 0) {
      setErrorMsg('Please select at least one supported platform.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await communityApi.suggestResource({
        title,
        tagline,
        description,
        websiteUrl,
        pricingModel,
        platforms,
        categoryId,
      });

      setSuccessMsg('Thank you! Your resource suggestion has been submitted for peer and admin review.');
      setTitle('');
      setTagline('');
      setDescription('');
      setWebsiteUrl('');
      setPlatforms(['IOS', 'ANDROID']);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit resource suggestion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <Users className="h-3.5 w-3.5" />
            <span>Community Contributions</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Suggest a Wellness Resource</h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover a great focus app, website blocker, or habit tool? Share it with fellow students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/community/my-submissions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> My Submissions
          </Link>
          <Link
            to="/community/feedback"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Feedback & Reports
          </Link>
        </div>
      </div>

      {/* Suggestion Form */}
      <Card className="mt-8 border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Submission Received</p>
              <p className="text-xs text-emerald-400/90 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tool / Resource Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Forest, Freedom, Opal"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Website URL *
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Short Tagline *
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Gamified Pomodoro timer that grows virtual forests while studying"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description & Why It Helps Students *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe key features, how it handles privacy, and student use cases..."
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCats}
                aria-label="Category selection"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pricing Model *
              </label>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                aria-label="Pricing model selection"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {PRICING_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Supported Platforms (Select all that apply) *
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PLATFORMS.map((p) => {
                const selected = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleTogglePlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Submissions undergo administrative privacy & security review
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Resource'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
