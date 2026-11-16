export type SessionType = 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CUSTOM';

export interface FocusSession {
  id: string;
  userId: string;
  sessionType: SessionType;
  durationMinutes: number;
  intention?: string | null;
  reflection?: string | null;
  distractionsCount: number;
  focusRating?: number | null;
  completedAt: string;
  createdAt: string;
}

export interface FocusSummary {
  todayMinutes: number;
  todaySessions: number;
  weekMinutes: number;
  weekSessions: number;
  totalMinutes: number;
  totalSessions: number;
  avgFocusRating: number | null;
  recentSessionsToday: FocusSession[];
  weeklyTrend: {
    date: string;
    dayName: string;
    minutes: number;
    sessions: number;
  }[];
}

export interface CreateFocusSessionPayload {
  sessionType?: SessionType;
  durationMinutes: number;
  intention?: string;
  reflection?: string;
  distractionsCount?: number;
  focusRating?: number;
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

export interface ScreenTimeLog {
  id: string;
  userId: string;
  logDate: string;
  totalMinutes: number;
  productiveMinutes: number;
  distractingMinutes: number;
  pickupsCount: number;
  categoryBreakdown?: ScreenTimeCategoryBreakdown | null;
  notes?: string | null;
  createdAt: string;
}

export interface ScreenTimeGoal {
  id?: string;
  userId?: string;
  maxDailyMinutes: number;
  maxDistractingMinutes: number;
  targetBedtimeHour: number;
  isActive: boolean;
}

export interface ScreenTimeSummary {
  todayLog: ScreenTimeLog | null;
  goal: ScreenTimeGoal;
  remainingMinutes: number;
  isExceeded: boolean;
  weeklyTrend: {
    date: string;
    dayName: string;
    totalMinutes: number;
    productiveMinutes: number;
    distractingMinutes: number;
  }[];
  weeklyTotalMinutes: number;
  weeklyAvgMinutes: number;
  recentLogs: ScreenTimeLog[];
}

export interface CreateScreenTimePayload {
  logDate?: string;
  totalMinutes: number;
  productiveMinutes?: number;
  distractingMinutes?: number;
  pickupsCount?: number;
  categoryBreakdown?: ScreenTimeCategoryBreakdown;
  notes?: string;
}

// Assessment Types
export type WellnessDimension =
  | 'screenTimeAwareness'
  | 'focusBehavior'
  | 'deviceHabits'
  | 'sleepAndRestoration'
  | 'socialDigitalBalance';

export type WellnessTier = 'CRITICAL' | 'MODERATE' | 'BALANCED' | 'OPTIMAL';

export interface AssessmentResponse {
  questionId: string;
  dimensionId: WellnessDimension;
  score: number;
}

export interface WellnessAssessment {
  id: string;
  userId: string;
  overallScore: number;
  dimensionScores: Record<string, number>;
  responses: AssessmentResponse[];
  calculatedTier: WellnessTier;
  recommendations: string[];
  dimensionLabels?: Record<string, string>;
  disclaimer?: string;
  completedAt: string;
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

export interface DailyPlan {
  id: string;
  userId: string;
  planDate: string;
  digitalIntention: string;
  priorityTasks: PlannerTask[];
  shutdownCompleted: boolean;
  shutdownAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertPlannerPayload {
  planDate?: string;
  digitalIntention: string;
  priorityTasks?: PlannerTask[];
}

// Dashboard Types
export interface DashboardSummary {
  focus: {
    todayMinutes: number;
    todaySessions: number;
    weekMinutes: number;
    weekSessions: number;
    totalMinutes: number;
    totalSessions: number;
  };
  screenTime: {
    todayMinutes: number;
    productiveMinutes: number;
    distractingMinutes: number;
    pickupsCount: number;
    goal: ScreenTimeGoal;
    remainingMinutes: number;
    isExceeded: boolean;
  };
  assessment: {
    id: string;
    overallScore: number;
    tier: WellnessTier;
    completedAt: string;
    recommendations: string[];
  } | null;
  planner: {
    id: string;
    planDate: string;
    digitalIntention: string;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    shutdownCompleted: boolean;
    shutdownAt: string | null;
    tasks: PlannerTask[];
  } | null;
}
