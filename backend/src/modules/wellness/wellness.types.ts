import { SessionType, WellnessTier } from '@prisma/client';

export { WellnessTier };

export type WellnessDimension =
  | 'screenTimeAwareness'
  | 'focusBehavior'
  | 'deviceHabits'
  | 'sleepAndRestoration'
  | 'socialDigitalBalance';

export interface AssessmentResponse {
  questionId: string;
  dimensionId: WellnessDimension;
  score: number; // 1-5
}

export interface SubmitAssessmentDTO {
  responses: AssessmentResponse[];
}

export interface DimensionScore {
  dimension: WellnessDimension;
  score: number;
  label: string;
}

// Focus Types
export interface CreateFocusSessionDTO {
  sessionType?: SessionType;
  durationMinutes: number;
  intention?: string | null;
  reflection?: string | null;
  distractionsCount?: number;
  focusRating?: number | null;
}

export interface FocusSessionQueryParams {
  page?: number;
  limit?: number;
  sessionType?: SessionType;
  startDate?: string;
  endDate?: string;
}

// Screen Time Types
export interface ScreenTimeCategoryBreakdown {
  socialMedia?: number;
  entertainment?: number;
  education?: number;
  gaming?: number;
  productivity?: number;
  other?: number;
  [key: string]: number | undefined;
}

export interface CreateScreenTimeLogDTO {
  logDate?: string; // YYYY-MM-DD
  totalMinutes: number;
  productiveMinutes?: number;
  distractingMinutes?: number;
  pickupsCount?: number;
  categoryBreakdown?: ScreenTimeCategoryBreakdown;
  notes?: string | null;
}

export interface UpdateScreenTimeLogDTO {
  totalMinutes?: number;
  productiveMinutes?: number;
  distractingMinutes?: number;
  pickupsCount?: number;
  categoryBreakdown?: ScreenTimeCategoryBreakdown;
  notes?: string | null;
}

export interface ScreenTimeQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface UpsertScreenTimeGoalDTO {
  maxDailyMinutes?: number;
  maxDistractingMinutes?: number;
  targetBedtimeHour?: number;
  isActive?: boolean;
}

// Planner Types
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PlannerTask {
  id: string;
  text: string;
  description?: string;
  priority?: TaskPriority;
  completed: boolean;
  timeEstimateMinutes?: number;
}

export interface UpsertDailyPlannerDTO {
  planDate?: string; // YYYY-MM-DD
  digitalIntention: string;
  priorityTasks?: PlannerTask[];
}

export interface UpdateDailyPlannerDTO {
  digitalIntention?: string;
  priorityTasks?: PlannerTask[];
  shutdownCompleted?: boolean;
}
