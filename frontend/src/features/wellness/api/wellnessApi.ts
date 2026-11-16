import { apiRequest } from '../../../services/apiClient';
import {
  FocusSession,
  FocusSummary,
  CreateFocusSessionPayload,
  ScreenTimeLog,
  ScreenTimeGoal,
  ScreenTimeSummary,
  CreateScreenTimePayload,
  WellnessAssessment,
  AssessmentResponse,
  DailyPlan,
  UpsertPlannerPayload,
  DashboardSummary,
} from '../types/wellness.types';

export const wellnessApi = {
  // Focus Endpoints
  async createFocusSession(payload: CreateFocusSessionPayload): Promise<FocusSession> {
    const res = await apiRequest<{ success: boolean; data: FocusSession }>(
      '/wellness/focus-sessions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  async getFocusSessions(page = 1, limit = 20): Promise<{ sessions: FocusSession[]; total: number }> {
    const res = await apiRequest<{ success: boolean; data: FocusSession[]; meta: { total: number } }>(
      `/wellness/focus-sessions?page=${page}&limit=${limit}`,
      { method: 'GET' }
    );
    return { sessions: res.data, total: res.meta?.total ?? res.data.length };
  },

  async getFocusSummary(): Promise<FocusSummary> {
    const res = await apiRequest<{ success: boolean; data: FocusSummary }>(
      '/wellness/focus-summary',
      { method: 'GET' }
    );
    return res.data;
  },

  async deleteFocusSession(id: string): Promise<void> {
    await apiRequest(`/wellness/focus-sessions/${id}`, { method: 'DELETE' });
  },

  // Screen Time Endpoints
  async logScreenTime(payload: CreateScreenTimePayload): Promise<ScreenTimeLog> {
    const res = await apiRequest<{ success: boolean; data: ScreenTimeLog }>(
      '/wellness/screen-time',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  async getScreenTimeLogs(limit = 30): Promise<ScreenTimeLog[]> {
    const res = await apiRequest<{ success: boolean; data: ScreenTimeLog[] }>(
      `/wellness/screen-time?limit=${limit}`,
      { method: 'GET' }
    );
    return res.data;
  },

  async getScreenTimeSummary(): Promise<ScreenTimeSummary> {
    const res = await apiRequest<{ success: boolean; data: ScreenTimeSummary }>(
      '/wellness/screen-time-summary',
      { method: 'GET' }
    );
    return res.data;
  },

  async deleteScreenTimeLog(id: string): Promise<void> {
    await apiRequest(`/wellness/screen-time/${id}`, { method: 'DELETE' });
  },

  async getScreenTimeGoal(): Promise<ScreenTimeGoal> {
    const res = await apiRequest<{ success: boolean; data: ScreenTimeGoal }>(
      '/wellness/screen-time-goals',
      { method: 'GET' }
    );
    return res.data;
  },

  async updateScreenTimeGoal(goal: Partial<ScreenTimeGoal>): Promise<ScreenTimeGoal> {
    const res = await apiRequest<{ success: boolean; data: ScreenTimeGoal }>(
      '/wellness/screen-time-goals',
      {
        method: 'PUT',
        body: JSON.stringify(goal),
      }
    );
    return res.data;
  },

  // Assessment Endpoints
  async submitAssessment(responses: AssessmentResponse[]): Promise<WellnessAssessment> {
    const res = await apiRequest<{ success: boolean; data: WellnessAssessment }>(
      '/wellness/assessments',
      {
        method: 'POST',
        body: JSON.stringify({ responses }),
      }
    );
    return res.data;
  },

  async getAssessmentHistory(): Promise<WellnessAssessment[]> {
    const res = await apiRequest<{ success: boolean; data: WellnessAssessment[] }>(
      '/wellness/assessments',
      { method: 'GET' }
    );
    return res.data;
  },

  async getLatestAssessment(): Promise<WellnessAssessment | null> {
    const res = await apiRequest<{ success: boolean; data: WellnessAssessment | null }>(
      '/wellness/assessments/latest',
      { method: 'GET' }
    );
    return res.data;
  },

  // Daily Planner Endpoints
  async getDailyPlanner(date?: string): Promise<DailyPlan | null> {
    const query = date ? `?date=${date}` : '';
    const res = await apiRequest<{ success: boolean; data: DailyPlan | null }>(
      `/wellness/planner${query}`,
      { method: 'GET' }
    );
    return res.data;
  },

  async upsertDailyPlanner(payload: UpsertPlannerPayload): Promise<DailyPlan> {
    const res = await apiRequest<{ success: boolean; data: DailyPlan }>(
      '/wellness/planner',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  async updateDailyPlanner(
    date: string,
    payload: { digitalIntention?: string; priorityTasks?: DailyPlan['priorityTasks']; shutdownCompleted?: boolean }
  ): Promise<DailyPlan> {
    const res = await apiRequest<{ success: boolean; data: DailyPlan }>(
      `/wellness/planner/${date}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  async getRecentDailyPlanners(): Promise<DailyPlan[]> {
    const res = await apiRequest<{ success: boolean; data: DailyPlan[] }>(
      '/wellness/planner/recent',
      { method: 'GET' }
    );
    return res.data;
  },

  // Dashboard Summary Endpoint
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await apiRequest<{ success: boolean; data: DashboardSummary }>(
      '/wellness/dashboard-summary',
      { method: 'GET' }
    );
    return res.data;
  },
};
