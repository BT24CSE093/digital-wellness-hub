import { apiRequest } from '../../../services/apiClient';
import {
  ResourceSuggestion,
  FeedbackSubmission,
  ContentReport,
  UserSubmissionsSummary,
  SubmissionStatus,
  FeedbackType,
  ReportContentType,
} from '../types/community.types';

export const communityApi = {
  // Student - Resource Suggestion
  async suggestResource(data: {
    title: string;
    tagline: string;
    description: string;
    websiteUrl: string;
    pricingModel: string;
    platforms: string[];
    categoryId: string;
  }): Promise<ResourceSuggestion> {
    const res = await apiRequest<{ success: boolean; data: ResourceSuggestion }>(
      '/community/suggestions',
      { method: 'POST', body: JSON.stringify(data) }
    );
    return res.data;
  },

  // Student - Submit Feedback
  async submitFeedback(data: {
    type: FeedbackType;
    title: string;
    details: string;
    pageUrl?: string;
  }): Promise<FeedbackSubmission> {
    const res = await apiRequest<{ success: boolean; data: FeedbackSubmission }>(
      '/community/feedback',
      { method: 'POST', body: JSON.stringify(data) }
    );
    return res.data;
  },

  // Student - Submit Content Report
  async submitReport(data: {
    contentType: ReportContentType;
    contentId: string;
    reason: string;
    details?: string;
  }): Promise<ContentReport> {
    const res = await apiRequest<{ success: boolean; data: ContentReport }>(
      '/community/reports',
      { method: 'POST', body: JSON.stringify(data) }
    );
    return res.data;
  },

  // Student - My Submissions
  async getMySubmissions(): Promise<UserSubmissionsSummary> {
    const res = await apiRequest<{ success: boolean; data: UserSubmissionsSummary }>(
      '/community/my-submissions',
      { method: 'GET' }
    );
    return res.data;
  },

  // Admin - Moderation
  async listAdminSuggestions(status?: SubmissionStatus): Promise<ResourceSuggestion[]> {
    const qs = status ? `?status=${status}` : '';
    const res = await apiRequest<{ success: boolean; data: ResourceSuggestion[] }>(
      `/community/admin/suggestions${qs}`,
      { method: 'GET' }
    );
    return res.data;
  },

  async moderateSuggestion(
    id: string,
    status: SubmissionStatus,
    adminNotes?: string
  ): Promise<ResourceSuggestion> {
    const res = await apiRequest<{ success: boolean; data: ResourceSuggestion }>(
      `/community/admin/suggestions/${id}`,
      { method: 'PATCH', body: JSON.stringify({ status, adminNotes }) }
    );
    return res.data;
  },

  async listAdminFeedback(status?: SubmissionStatus, type?: FeedbackType): Promise<FeedbackSubmission[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ success: boolean; data: FeedbackSubmission[] }>(
      `/community/admin/feedback${qs}`,
      { method: 'GET' }
    );
    return res.data;
  },

  async moderateFeedback(
    id: string,
    status: SubmissionStatus,
    adminNotes?: string
  ): Promise<FeedbackSubmission> {
    const res = await apiRequest<{ success: boolean; data: FeedbackSubmission }>(
      `/community/admin/feedback/${id}`,
      { method: 'PATCH', body: JSON.stringify({ status, adminNotes }) }
    );
    return res.data;
  },

  async listAdminReports(status?: SubmissionStatus): Promise<ContentReport[]> {
    const qs = status ? `?status=${status}` : '';
    const res = await apiRequest<{ success: boolean; data: ContentReport[] }>(
      `/community/admin/reports${qs}`,
      { method: 'GET' }
    );
    return res.data;
  },

  async moderateReport(
    id: string,
    status: SubmissionStatus,
    adminNotes?: string
  ): Promise<ContentReport> {
    const res = await apiRequest<{ success: boolean; data: ContentReport }>(
      `/community/admin/reports/${id}`,
      { method: 'PATCH', body: JSON.stringify({ status, adminNotes }) }
    );
    return res.data;
  },
};
