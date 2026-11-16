import { apiRequest } from '../../../services/apiClient';
import {
  Resource,
  Category,
  ResourceFilterState,
  PaginatedResourcesResponse,
} from '../types/resource.types';

export const resourcesApi = {
  async getResources(params: ResourceFilterState = {}): Promise<PaginatedResourcesResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.category) query.set('category', params.category);
    if (params.platform) query.set('platform', params.platform);
    if (params.pricingModel) query.set('pricingModel', params.pricingModel);
    if (params.isVerified !== undefined) query.set('isVerified', params.isVerified.toString());
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const queryString = query.toString();
    const endpoint = `/resources${queryString ? `?${queryString}` : ''}`;

    return apiRequest<PaginatedResourcesResponse>(endpoint, { skipAuth: true });
  },

  async getResourceByIdOrSlug(idOrSlug: string): Promise<{ success: boolean; data: Resource }> {
    return apiRequest<{ success: boolean; data: Resource }>(`/resources/${idOrSlug}`, {
      skipAuth: true,
    });
  },

  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return apiRequest<{ success: boolean; data: Category[] }>('/categories', {
      skipAuth: true,
    });
  },
};
