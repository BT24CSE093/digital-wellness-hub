import { apiRequest } from '../../../services/apiClient';
import {
  Challenge,
  ChallengeEnrollment,
  ChallengeQueryParams,
  CreateChallengePayload,
  UpdateChallengePayload,
  Achievement,
  GamificationDashboard,
  AdminChallengeStats,
} from '../types/challenge.types';

export const challengesApi = {
  // Public Challenge Library
  async listChallenges(
    params: ChallengeQueryParams = {}
  ): Promise<{ challenges: Challenge[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.minDuration) query.set('minDuration', String(params.minDuration));
    if (params.maxDuration) query.set('maxDuration', String(params.maxDuration));
    if (params.search) query.set('search', params.search);
    if (params.isPublished !== undefined) query.set('isPublished', String(params.isPublished));

    const qs = query.toString();
    const endpoint = `/challenges${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<{ success: boolean; data: Challenge[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      endpoint,
      { method: 'GET' }
    );
    return { challenges: res.data, meta: res.meta };
  },

  async getChallenge(idOrSlug: string): Promise<Challenge> {
    const res = await apiRequest<{ success: boolean; data: Challenge }>(
      `/challenges/${idOrSlug}`,
      { method: 'GET' }
    );
    return res.data;
  },

  // Student Enrollment & Progress
  async enroll(challengeId: string): Promise<ChallengeEnrollment> {
    const res = await apiRequest<{ success: boolean; data: ChallengeEnrollment }>(
      `/challenges/${challengeId}/enroll`,
      { method: 'POST' }
    );
    return res.data;
  },

  async cancelEnrollment(challengeId: string): Promise<void> {
    await apiRequest(`/challenges/${challengeId}/enroll`, { method: 'DELETE' });
  },

  async listMyEnrollments(): Promise<ChallengeEnrollment[]> {
    const res = await apiRequest<{ success: boolean; data: ChallengeEnrollment[] }>(
      '/challenges/my',
      { method: 'GET' }
    );
    return res.data;
  },

  async getMyEnrollmentDetail(enrollmentId: string): Promise<ChallengeEnrollment> {
    const res = await apiRequest<{ success: boolean; data: ChallengeEnrollment }>(
      `/challenges/my/${enrollmentId}`,
      { method: 'GET' }
    );
    return res.data;
  },

  async updateProgress(
    enrollmentId: string,
    dayNumber: number,
    completed = true
  ): Promise<ChallengeEnrollment> {
    const res = await apiRequest<{ success: boolean; data: ChallengeEnrollment }>(
      `/challenges/my/${enrollmentId}/progress`,
      {
        method: 'PUT',
        body: JSON.stringify({ dayNumber, completed }),
      }
    );
    return res.data;
  },

  // Gamification & Achievements
  async getAchievements(): Promise<Achievement[]> {
    const res = await apiRequest<{ success: boolean; data: Achievement[] }>(
      '/challenges/achievements',
      { method: 'GET' }
    );
    return res.data;
  },

  async getGamificationDashboard(): Promise<GamificationDashboard> {
    const res = await apiRequest<{ success: boolean; data: GamificationDashboard }>(
      '/challenges/dashboard',
      { method: 'GET' }
    );
    return res.data;
  },

  // Admin Challenge Management
  async createChallenge(payload: CreateChallengePayload): Promise<Challenge> {
    const res = await apiRequest<{ success: boolean; data: Challenge }>(
      '/challenges/admin',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  async updateChallenge(id: string, payload: UpdateChallengePayload): Promise<Challenge> {
    const res = await apiRequest<{ success: boolean; data: Challenge }>(
      `/challenges/admin/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  async togglePublish(id: string): Promise<Challenge> {
    const res = await apiRequest<{ success: boolean; data: Challenge }>(
      `/challenges/admin/${id}/publish`,
      { method: 'PATCH' }
    );
    return res.data;
  },

  async deleteChallenge(id: string): Promise<void> {
    await apiRequest(`/challenges/admin/${id}`, { method: 'DELETE' });
  },

  async getAdminStats(): Promise<AdminChallengeStats> {
    const res = await apiRequest<{ success: boolean; data: AdminChallengeStats }>(
      '/challenges/admin/stats',
      { method: 'GET' }
    );
    return res.data;
  },
};
