import { apiRequest } from '../../../services/apiClient';
import {
  GuideQueryParams,
  PaginatedGuidesResponse,
  GuideDetailResponse,
} from '../types/guide.types';

export const guidesApi = {
  async getGuides(params: GuideQueryParams = {}): Promise<PaginatedGuidesResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.platform) query.set('platform', params.platform);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString();
    const endpoint = `/guides${queryString ? `?${queryString}` : ''}`;

    return apiRequest<PaginatedGuidesResponse>(endpoint, { skipAuth: true });
  },

  async getGuideBySlug(slug: string): Promise<GuideDetailResponse> {
    return apiRequest<GuideDetailResponse>(`/guides/${slug}`, { skipAuth: true });
  },
};
