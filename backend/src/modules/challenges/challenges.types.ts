import { Difficulty, ChallengeStatus } from '@prisma/client';

export { Difficulty as ChallengeDifficulty, ChallengeStatus };

export interface ChallengeActivity {
  day: number;
  title: string;
  instructions: string;
}

export interface ChallengeDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  durationDays: number;
  difficulty: Difficulty;
  badgeIcon: string;
  isPublished: boolean;
  createdAt: Date;
  activities: ChallengeActivity[];
  enrollmentCount?: number;
  isEnrolled?: boolean;
  userEnrollment?: ChallengeEnrollmentSummary | null;
}

export interface ChallengeEnrollmentSummary {
  id: string;
  userId: string;
  challengeId: string;
  status: ChallengeStatus;
  startDate: Date;
  completedDate: Date | null;
  currentStreak: number;
  completedDays: number[];
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
  challenge?: {
    id: string;
    title: string;
    slug: string;
    durationDays: number;
    difficulty: Difficulty;
    badgeIcon: string;
    description: string;
  };
}

export interface ChallengeQueryParams {
  page?: number;
  limit?: number;
  difficulty?: Difficulty;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
  isPublished?: boolean;
}

export interface CreateChallengeDTO {
  title: string;
  description: string;
  durationDays: number;
  difficulty?: Difficulty;
  badgeIcon?: string;
  isPublished?: boolean;
  activities?: ChallengeActivity[];
}

export interface UpdateChallengeDTO {
  title?: string;
  description?: string;
  durationDays?: number;
  difficulty?: Difficulty;
  badgeIcon?: string;
  isPublished?: boolean;
  activities?: ChallengeActivity[];
}

export interface UpdateProgressDTO {
  dayNumber: number;
  completed?: boolean;
  notes?: string;
}

// Achievements
export type AchievementCategory =
  | 'FOCUS'
  | 'SCREEN_TIME'
  | 'ASSESSMENT'
  | 'PLANNER'
  | 'CHALLENGE';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  badgeIcon: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
  percentage: number;
}

export interface GamificationDashboard {
  activeEnrollments: ChallengeEnrollmentSummary[];
  completedEnrollments: ChallengeEnrollmentSummary[];
  earnedAchievements: Achievement[];
  totalAchievementsCount: number;
  unlockedAchievementsCount: number;
  nextMilestones: Achievement[];
  encouragementMessage: string;
}
