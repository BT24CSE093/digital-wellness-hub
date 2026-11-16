import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resourcesApi } from '../../resources/api/resourcesApi';
import { adminContentApi } from '../api/adminContentApi';
import { Resource, Category } from '../../resources/types/resource.types';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  X,
} from 'lucide-react';

const PLATFORM_OPTIONS = ['WINDOWS', 'MACOS', 'LINUX', 'IOS', 'ANDROID', 'BROWSER'];
const PRICING_OPTIONS = ['FREE', 'FREEMIUM', 'PAID', 'OPEN_SOURCE'];

export const AdminResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    pricingModel: 'FREEMIUM',
    platforms: ['WINDOWS', 'MACOS'],
    categoryId: '',
    isVerified: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resData, catData] = await Promise.all([
        resourcesApi.getResources({ limit: 50 }),
        resourcesApi.getCategories(),
      ]);
      if (resData.success) setResources(resData.data);
      if (catData.success) {
        setCategories(catData.data);
        if (catData.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catData.data[0].id }));
        }
      }
    } catch (err: any) {
      console.error('Failed to load admin resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      tagline: '',
      description: '',
      websiteUrl: '',
      pricingModel: 'FREEMIUM',
      platforms: ['WINDOWS', 'MACOS'],
      categoryId: categories[0]?.id || '',
      isVerified: false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (res: Resource) => {
    setEditingResource(res);
    setFormData({
      title: res.title,
      tagline: res.tagline,
      description: res.description,
      websiteUrl: res.websiteUrl,
      pricingModel: res.pricingModel,
      platforms: res.platforms,
      categoryId: res.categoryId,
      isVerified: res.isVerified,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleTogglePlatform = (plat: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(plat)
        ? prev.platforms.filter((p) => p !== plat)
        : [...prev.platforms, plat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (editingResource) {
        await adminContentApi.updateResource(editingResource.id, formData);
      } else {
        await adminContentApi.createResource(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVerify = async (resource: Resource) => {
    try {
      await adminContentApi.verifyResource(resource.id, !resource.isVerified);
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, isVerified: !r.isVerified } : r))
      );
    } catch (err: any) {
      alert(`Error toggling verification: ${err?.message}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await adminContentApi.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(`Error deleting resource: ${err?.message}`);
    }
  };

  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/admin" className="hover:text-emerald-400 transition-colors">
              Admin Control
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">Resources</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resource Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review, verify, edit, and organize software tools available to students.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Resource</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search catalog resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Resources Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-5">Resource</th>
              <th className="py-4 px-5">Category</th>
              <th className="py-4 px-5">Pricing</th>
              <th className="py-4 px-5">Platforms</th>
              <th className="py-4 px-5">Verification</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Loading catalog...
                </td>
              </tr>
            ) : filteredResources.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No resources found.
                </td>
              </tr>
            ) : (
              filteredResources.map((res) => (
                <tr key={res.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-white">{res.title}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{res.tagline}</div>
                  </td>
                  <td className="py-4 px-5 text-slate-300">
                    {res.category?.name || 'Unassigned'}
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {res.pricingModel}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {res.platforms.map((p) => (
                        <span
                          key={p}
                          className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => handleToggleVerify(res)}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border transition-all ${
                        res.isVerified
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900/60'
                          : 'bg-amber-950/50 text-amber-300 border-amber-800/60 hover:bg-amber-900/40'
                      }`}
                      title="Click to toggle verification status"
                    >
                      {res.isVerified ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Unverified</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(res)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit Resource"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id, res.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Resource"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingResource ? `Edit "${editingResource.title}"` : 'Add New Knowledge Base Resource'}
              </h3>
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
                <label className="block text-slate-300 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Forest App"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tagline *</label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Gamified focus timer for academic flow"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                  placeholder="Provide an objective, non-promotional summary of features and use cases..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Website URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Pricing Model *</label>
                <div className="flex flex-wrap gap-2">
                  {PRICING_OPTIONS.map((pm) => (
                    <button
                      type="button"
                      key={pm}
                      onClick={() => setFormData((prev) => ({ ...prev, pricingModel: pm }))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                        formData.pricingModel === pm
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Supported Platforms *</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((plat) => {
                    const isSelected = formData.platforms.includes(plat);
                    return (
                      <button
                        type="button"
                        key={plat}
                        onClick={() => handleTogglePlatform(plat)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                          isSelected
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {plat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isVerified: e.target.checked }))}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Mark as Staff Verified immediately</span>
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
                  {submitting ? 'Saving...' : editingResource ? 'Update Resource' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
