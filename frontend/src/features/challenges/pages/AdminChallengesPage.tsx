import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { challengesApi } from '../api/challengesApi';
import {
  Challenge,
  ChallengeDifficulty,
  ChallengeActivity,
  AdminChallengeStats,
} from '../types/challenge.types';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  X,
  Award,
  Users,
  Calendar,
  Sparkles,
  ArrowLeft,
  Flame,
  AlertCircle,
} from 'lucide-react';

const DIFFICULTY_OPTIONS: ChallengeDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const BADGE_OPTIONS = ['award', 'flame', 'sun', 'moon', 'sparkles', 'compass', 'shield', 'target'];

export const AdminChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<AdminChallengeStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>('BEGINNER');
  const [badgeIcon, setBadgeIcon] = useState('award');
  const [isPublished, setIsPublished] = useState(true);
  const [activities, setActivities] = useState<ChallengeActivity[]>([
    { day: 1, title: 'Orientation & Baseline', instructions: 'Set up your environment and commit to the challenge protocol.' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, statsData] = await Promise.all([
        challengesApi.listChallenges({ limit: 100 }),
        challengesApi.getAdminStats(),
      ]);
      setChallenges(res.challenges);
      setStats(statsData);
    } catch (err: unknown) {
      console.error('Failed to load challenge administration data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingChallenge(null);
    setTitle('');
    setDescription('');
    setDurationDays(7);
    setDifficulty('BEGINNER');
    setBadgeIcon('award');
    setIsPublished(true);
    setActivities(
      Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1} Action Step`,
        instructions: `Complete the mindful practice for day ${i + 1}.`,
      }))
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Challenge) => {
    setEditingChallenge(c);
    setTitle(c.title);
    setDescription(c.description);
    setDurationDays(c.durationDays);
    setDifficulty(c.difficulty);
    setBadgeIcon(c.badgeIcon || 'award');
    setIsPublished(c.isPublished);
    setActivities(
      c.activities && c.activities.length > 0
        ? c.activities
        : Array.from({ length: c.durationDays }, (_, i) => ({
            day: i + 1,
            title: `Day ${i + 1} Action Step`,
            instructions: `Complete the mindful practice for day ${i + 1}.`,
          }))
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDurationChange = (newDays: number) => {
    const days = Math.max(1, Math.min(30, newDays));
    setDurationDays(days);
    // Adjust activities list
    setActivities((prev) => {
      const updated = [...prev];
      if (updated.length < days) {
        for (let i = updated.length + 1; i <= days; i++) {
          updated.push({
            day: i,
            title: `Day ${i} Action Step`,
            instructions: `Complete the practice for day ${i}.`,
          });
        }
      } else if (updated.length > days) {
        return updated.slice(0, days);
      }
      return updated;
    });
  };

  const handleUpdateActivity = (index: number, field: 'title' | 'instructions', val: string) => {
    setActivities((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editingChallenge) {
        await challengesApi.updateChallenge(editingChallenge.id, {
          title: title.trim(),
          description: description.trim(),
          durationDays,
          difficulty,
          badgeIcon,
          isPublished,
          activities,
        });
      } else {
        await challengesApi.createChallenge({
          title: title.trim(),
          description: description.trim(),
          durationDays,
          difficulty,
          badgeIcon,
          isPublished,
          activities,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await challengesApi.togglePublish(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle challenge publication state.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete challenge "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await challengesApi.deleteChallenge(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete challenge.');
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = filterDifficulty === 'ALL' || c.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      {/* Navigation Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Panel
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Wellness Challenge Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Author protocols, curate daily step-by-step activities, and track platform student participation.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-950/40"
        >
          <Plus className="h-4 w-4" />
          <span>New Challenge</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Total Challenges</span>
              <Award className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-white font-mono">{stats.totalChallenges}</span>
            <p className="text-[11px] text-slate-500 mt-1">Available protocols</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Total Enrollments</span>
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-blue-400 font-mono">{stats.totalEnrollments}</span>
            <p className="text-[11px] text-slate-500 mt-1">All time student starts</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Published</span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-amber-400 font-mono">{stats.publishedChallenges}</span>
            <p className="text-[11px] text-slate-500 mt-1">Live in catalog</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Completed</span>
              <CheckCircle className="h-4 w-4 text-teal-400" />
            </div>
            <span className="text-2xl font-bold text-teal-400 font-mono">{stats.completedEnrollments}</span>
            <p className="text-[11px] text-slate-500 mt-1">Successful finishes</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search challenges by title or protocol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          aria-label="Filter challenges by difficulty"
          className="px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
        >
          <option value="ALL">All Difficulties</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      {/* Challenges Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-sm text-slate-400">Loading challenge catalog...</p>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800/80 rounded-2xl">
          <Award className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No challenges found</h3>
          <p className="text-xs text-slate-400 mt-1">Try modifying your search or create your first challenge.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Challenge</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Enrollments</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredChallenges.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-emerald-400">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{c.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-sm">{c.description}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        c.difficulty === 'BEGINNER'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : c.difficulty === 'INTERMEDIATE'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {c.difficulty}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-slate-300 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{c.durationDays} Days</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleTogglePublish(c.id)}
                      className="inline-flex items-center gap-1.5 text-xs"
                      title="Click to toggle publish status"
                    >
                      {c.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="py-4 px-4 text-slate-300 text-xs font-mono">
                    {c.enrollmentCount || 0} students
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Challenge"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Challenge"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingChallenge ? 'Edit Challenge' : 'Create New Wellness Challenge'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 my-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Challenge Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 7-Day Mindful Screen-Time"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Wellness Philosophy *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why this challenge helps students reclaim control over attention..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (Days: 1-30) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={durationDays}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Badge Motif
                  </label>
                  <select
                    value={badgeIcon}
                    onChange={(e) => setBadgeIcon(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {BADGE_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="isPublishedCheck" className="text-xs text-slate-300 select-none">
                  Publish immediately (visible to all students in public library)
                </label>
              </div>

              {/* Daily Curriculum Builder */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span>Daily Curriculum Action Steps ({activities.length} days)</span>
                  </h3>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {activities.map((act, idx) => (
                    <div
                      key={act.day}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          Day {act.day}
                        </span>
                        <input
                          type="text"
                          value={act.title}
                          onChange={(e) => handleUpdateActivity(idx, 'title', e.target.value)}
                          placeholder={`Day ${act.day} Step Title`}
                          className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <input
                        type="text"
                        value={act.instructions}
                        onChange={(e) => handleUpdateActivity(idx, 'instructions', e.target.value)}
                        placeholder={`Day ${act.day} Instructions & mindful goal`}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-md shadow-emerald-950/50"
                >
                  {submitting ? 'Saving...' : editingChallenge ? 'Save Changes' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
