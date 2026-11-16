import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminContentApi } from '../api/adminContentApi';
import { DeviceGuide, GuideStep } from '../../guides/types/guide.types';
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  X,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

const PLATFORM_OPTIONS = ['IOS', 'ANDROID', 'MACOS', 'WINDOWS', 'LINUX', 'BROWSER'];
const DIFFICULTY_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const AdminGuidesPage: React.FC = () => {
  const [guides, setGuides] = useState<DeviceGuide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [platform, setPlatform] = useState('IOS');
  const [difficulty, setDifficulty] = useState('BEGINNER');
  const [estimatedMinutes, setEstimatedMinutes] = useState(5);
  const [isPublished, setIsPublished] = useState(false);
  const [steps, setSteps] = useState<GuideStep[]>([
    {
      stepNumber: 1,
      title: 'Initial Setup',
      instruction: 'Open device settings...',
      tip: '',
      warning: '',
    },
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const res = await adminContentApi.listAdminGuides();
      if (res.success) setGuides(res.data);
    } catch (err: any) {
      console.error('Failed to load admin guides', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuides();
  }, []);

  const handleOpenCreateModal = () => {
    setTitle('');
    setSlug('');
    setPlatform('IOS');
    setDifficulty('BEGINNER');
    setEstimatedMinutes(5);
    setIsPublished(false);
    setSteps([
      {
        stepNumber: 1,
        title: 'Initial Setup',
        instruction: 'Open device settings...',
        tip: '',
        warning: '',
      },
    ]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        title: '',
        instruction: '',
        tip: '',
        warning: '',
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const updated = steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setSteps(updated);
  };

  const handleStepChange = (index: number, field: keyof GuideStep, value: string) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await adminContentApi.createGuide({
        title,
        ...(slug ? { slug } : {}),
        platform,
        difficulty,
        estimatedMinutes: Number(estimatedMinutes),
        isPublished,
        steps,
      });
      setIsModalOpen(false);
      await loadGuides();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create guide.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (guide: DeviceGuide) => {
    try {
      await adminContentApi.publishGuide(guide.id, !guide.isPublished);
      setGuides((prev) =>
        prev.map((g) => (g.id === guide.id ? { ...g, isPublished: !g.isPublished } : g))
      );
    } catch (err: any) {
      alert(`Error toggling publication: ${err?.message}`);
    }
  };

  const handleDelete = async (id: string, guideTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${guideTitle}"?`)) return;
    try {
      await adminContentApi.deleteGuide(id);
      setGuides((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      alert(`Error deleting guide: ${err?.message}`);
    }
  };

  const filteredGuides = guides.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/admin" className="hover:text-emerald-400 transition-colors">
              Admin Control
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">Guides</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Device Guide Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Author and publish step-by-step technical tutorials across operating systems.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Guide</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search guides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-5">Guide Title</th>
              <th className="py-4 px-5">Platform</th>
              <th className="py-4 px-5">Difficulty</th>
              <th className="py-4 px-5">Duration</th>
              <th className="py-4 px-5">Steps</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Loading guides...
                </td>
              </tr>
            ) : filteredGuides.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No guides found.
                </td>
              </tr>
            ) : (
              filteredGuides.map((g) => (
                <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-white">{g.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">/guides/{g.slug}</div>
                  </td>
                  <td className="py-4 px-5 text-slate-300 font-medium">{g.platform}</td>
                  <td className="py-4 px-5">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {g.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-300">{g.estimatedMinutes} min</td>
                  <td className="py-4 px-5 text-slate-300">
                    {Array.isArray(g.steps) ? g.steps.length : 0} steps
                  </td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => handleTogglePublish(g)}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border transition-all ${
                        g.isPublished
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900/60'
                          : 'bg-amber-950/50 text-amber-300 border-amber-800/60 hover:bg-amber-900/40'
                      }`}
                      title="Click to toggle publication"
                    >
                      {g.isPublished ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleDelete(g.id, g.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete Guide"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating Guide */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-white">Create New Device Guide</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Guide Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. How to Enable Focus Mode on Android"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Platform *</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Difficulty *</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Est. Minutes *</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    required
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Step Builder */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white">Step-by-Step Instructions</h4>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Another Step</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">Step {idx + 1}</span>
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            className="text-slate-500 hover:text-rose-400"
                            title="Delete this step"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Step title (e.g. Open Settings app)"
                          value={step.title}
                          onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                          className="w-full py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <textarea
                          required
                          rows={2}
                          placeholder="Detailed instructions for the student..."
                          value={step.instruction}
                          onChange={(e) => handleStepChange(idx, 'instruction', e.target.value)}
                          className="w-full py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Optional pro tip..."
                          value={step.tip || ''}
                          onChange={(e) => handleStepChange(idx, 'tip', e.target.value)}
                          className="w-full py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Optional warning..."
                          value={step.warning || ''}
                          onChange={(e) => handleStepChange(idx, 'warning', e.target.value)}
                          className="w-full py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Publish immediately to student directory</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating Guide...' : 'Create Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
