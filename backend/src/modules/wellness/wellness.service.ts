import { wellnessRepository } from './wellness.repository';
import {
  CreateFocusSessionDTO,
  FocusSessionQueryParams,
  CreateScreenTimeLogDTO,
  UpdateScreenTimeLogDTO,
  ScreenTimeQueryParams,
  UpsertScreenTimeGoalDTO,
  SubmitAssessmentDTO,
  WellnessDimension,
  UpsertDailyPlannerDTO,
  UpdateDailyPlannerDTO,
} from './wellness.types';
import { WellnessTier } from '@prisma/client';

const DIMENSION_LABELS: Record<WellnessDimension, string> = {
  screenTimeAwareness: 'Screen-Time Awareness',
  focusBehavior: 'Deep Focus & Flow',
  deviceHabits: 'Notification & Device Boundaries',
  sleepAndRestoration: 'Sleep Hygiene & Digital Sunset',
  socialDigitalBalance: 'Real-World Social Balance',
};

function calculateTier(score: number): WellnessTier {
  if (score >= 80) return 'OPTIMAL';
  if (score >= 60) return 'BALANCED';
  if (score >= 40) return 'MODERATE';
  return 'CRITICAL';
}

function generateEducationalRecommendations(dimensionScores: Record<string, number>): string[] {
  const recommendations: string[] = [];

  if ((dimensionScores.screenTimeAwareness ?? 100) < 60) {
    recommendations.push(
      'Track your pickup triggers: Place your phone in another room or across your study desk to introduce friction before unlocking.'
    );
  }

  if ((dimensionScores.focusBehavior ?? 100) < 60) {
    recommendations.push(
      'Try 25-minute Pomodoro study sprints: Work on a single task with zero notifications until the chime, followed by a true 5-minute break.'
    );
  }

  if ((dimensionScores.deviceHabits ?? 100) < 60) {
    recommendations.push(
      'Curate non-essential notifications: Switch social media and promotional alerts off, leaving only urgent personal communications active.'
    );
  }

  if ((dimensionScores.sleepAndRestoration ?? 100) < 60) {
    recommendations.push(
      'Institute a 30-minute Digital Sunset: Stop interactive screens 30–60 minutes before bed and switch to reading or a calming podcast.'
    );
  }

  if ((dimensionScores.socialDigitalBalance ?? 100) < 60) {
    recommendations.push(
      'Practice presence during meals and conversations: Keep phones face down and out of reach when sharing time with friends or classmates.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Maintain your intentional habits: You show strong digital boundaries. Continue reviewing your weekly screen time and focus rhythm.'
    );
  }

  return recommendations;
}

export class WellnessService {
  // ==========================================
  // FOCUS SESSIONS
  // ==========================================
  async createFocusSession(userId: string, data: CreateFocusSessionDTO) {
    return wellnessRepository.createFocusSession(userId, data);
  }

  async listFocusSessions(userId: string, params: FocusSessionQueryParams) {
    const { sessions, total } = await wellnessRepository.findFocusSessions(userId, params);
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    return {
      sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFocusSessionById(id: string, userId: string) {
    return wellnessRepository.findFocusSessionById(id, userId);
  }

  async deleteFocusSession(id: string, userId: string) {
    return wellnessRepository.deleteFocusSession(id, userId);
  }

  async getFocusSummary(userId: string) {
    return wellnessRepository.getFocusSummary(userId);
  }

  // ==========================================
  // SCREEN TIME LOGS & GOALS
  // ==========================================
  async upsertScreenTimeLog(userId: string, data: CreateScreenTimeLogDTO) {
    return wellnessRepository.upsertScreenTimeLog(userId, data);
  }

  async listScreenTimeLogs(userId: string, params: ScreenTimeQueryParams) {
    return wellnessRepository.findScreenTimeLogs(userId, params);
  }

  async getScreenTimeLogById(id: string, userId: string) {
    return wellnessRepository.findScreenTimeLogById(id, userId);
  }

  async updateScreenTimeLog(id: string, userId: string, data: UpdateScreenTimeLogDTO) {
    return wellnessRepository.updateScreenTimeLog(id, userId, data);
  }

  async deleteScreenTimeLog(id: string, userId: string) {
    return wellnessRepository.deleteScreenTimeLog(id, userId);
  }

  async getScreenTimeSummary(userId: string) {
    return wellnessRepository.getScreenTimeSummary(userId);
  }

  async upsertScreenTimeGoal(userId: string, data: UpsertScreenTimeGoalDTO) {
    return wellnessRepository.upsertScreenTimeGoal(userId, data);
  }

  async getScreenTimeGoal(userId: string) {
    const goal = await wellnessRepository.findScreenTimeGoal(userId);
    return (
      goal || {
        maxDailyMinutes: 360,
        maxDistractingMinutes: 120,
        targetBedtimeHour: 23,
        isActive: true,
      }
    );
  }

  // ==========================================
  // WELLNESS ASSESSMENTS
  // ==========================================
  async submitAssessment(userId: string, data: SubmitAssessmentDTO) {
    const { responses } = data;

    // Group scores by dimension
    const byDimension: Record<string, number[]> = {};
    for (const r of responses) {
      if (!byDimension[r.dimensionId]) {
        byDimension[r.dimensionId] = [];
      }
      byDimension[r.dimensionId].push(r.score);
    }

    // Convert 1-5 rating into 0-100 percentage
    const dimensionScores: Record<string, number> = {};
    for (const [dim, scores] of Object.entries(byDimension)) {
      const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
      dimensionScores[dim] = Math.round(((avg - 1) / 4) * 100);
    }

    const allDimValues = Object.values(dimensionScores);
    const overallScore =
      allDimValues.length > 0
        ? Math.round(allDimValues.reduce((sum, val) => sum + val, 0) / allDimValues.length)
        : 50;

    const tier = calculateTier(overallScore);
    const recommendations = generateEducationalRecommendations(dimensionScores);

    const assessment = await wellnessRepository.createAssessment(
      userId,
      overallScore,
      dimensionScores,
      tier,
      recommendations,
      responses
    );

    return {
      ...assessment,
      dimensionLabels: DIMENSION_LABELS,
      disclaimer:
        'This assessment is an educational self-reflection tool, not a clinical diagnostic instrument.',
    };
  }

  async listAssessments(userId: string) {
    return wellnessRepository.findAssessments(userId);
  }

  async getLatestAssessment(userId: string) {
    const assessment = await wellnessRepository.findLatestAssessment(userId);
    if (!assessment) return null;
    return {
      ...assessment,
      dimensionLabels: DIMENSION_LABELS,
      disclaimer:
        'This assessment is an educational self-reflection tool, not a clinical diagnostic instrument.',
    };
  }

  async getAssessmentById(id: string, userId: string) {
    const assessment = await wellnessRepository.findAssessmentById(id, userId);
    if (!assessment) return null;
    return {
      ...assessment,
      dimensionLabels: DIMENSION_LABELS,
      disclaimer:
        'This assessment is an educational self-reflection tool, not a clinical diagnostic instrument.',
    };
  }

  // ==========================================
  // DAILY PLANNER
  // ==========================================
  async upsertDailyPlanner(userId: string, data: UpsertDailyPlannerDTO) {
    return wellnessRepository.upsertDailyPlanner(userId, data);
  }

  async getDailyPlannerByDate(userId: string, dateStr?: string) {
    const targetDate = dateStr || new Date().toISOString().slice(0, 10);
    return wellnessRepository.findDailyPlannerByDate(userId, targetDate);
  }

  async updateDailyPlanner(userId: string, dateStr: string, data: UpdateDailyPlannerDTO) {
    return wellnessRepository.updateDailyPlanner(userId, dateStr, data);
  }

  async getRecentDailyPlanners(userId: string) {
    return wellnessRepository.findRecentDailyPlanners(userId);
  }

  // ==========================================
  // DASHBOARD SUMMARY
  // ==========================================
  async getDashboardSummary(userId: string) {
    return wellnessRepository.getDashboardSummary(userId);
  }
}

export const wellnessService = new WellnessService();
