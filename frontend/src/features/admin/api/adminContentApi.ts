import { apiRequest } from '../../../services/apiClient';
import { Resource, Category } from '../../resources/types/resource.types';
import { DeviceGuide, GuideQueryParams } from '../../guides/types/guide.types';

export const adminContentApi = {
  // Resources
  async createResource(data: any): Promise<{ success: boolean; data: Resource }> {
    return apiRequest<{ success: boolean; data: Resource }>('/admin/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateResource(id: string, data: any): Promise<{ success: boolean; data: Resource }> {
    return apiRequest<{ success: boolean; data: Resource }>(`/admin/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteResource(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/admin/resources/${id}`, {
      method: 'DELETE',
    });
  },

  async verifyResource(
    id: string,
    isVerified: boolean
  ): Promise<{ success: boolean; data: Resource }> {
    return apiRequest<{ success: boolean; data: Resource }>(`/admin/resources/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    });
  },

  // Categories
  async createCategory(data: any): Promise<{ success: boolean; data: Category }> {
    return apiRequest<{ success: boolean; data: Category }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: any): Promise<{ success: boolean; data: Category }> {
    return apiRequest<{ success: boolean; data: Category }>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Guides
  async listAdminGuides(
    params: GuideQueryParams = {}
  ): Promise<{ success: boolean; data: DeviceGuide[]; meta: any }> {
    const query = new URLSearchParams();
    if (params.platform) query.set('platform', params.platform);
    if (params.search) query.set('search', params.search);
    const queryString = query.toString();
    return apiRequest<{ success: boolean; data: DeviceGuide[]; meta: any }>(
      `/admin/guides${queryString ? `?${queryString}` : ''}`
    );
  },

  async createGuide(data: any): Promise<{ success: boolean; data: DeviceGuide }> {
    return apiRequest<{ success: boolean; data: DeviceGuide }>('/admin/guides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGuide(id: string, data: any): Promise<{ success: boolean; data: DeviceGuide }> {
    return apiRequest<{ success: boolean; data: DeviceGuide }>(`/admin/guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteGuide(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/admin/guides/${id}`, {
      method: 'DELETE',
    });
  },

  async publishGuide(
    id: string,
    isPublished: boolean
  ): Promise<{ success: boolean; data: DeviceGuide }> {
    return apiRequest<{ success: boolean; data: DeviceGuide }>(`/admin/guides/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    });
  },
};
