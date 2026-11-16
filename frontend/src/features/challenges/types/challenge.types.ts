export type ChallengeDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

export interface ChallengeActivity {
  day: number;
  title: string;
  instructions: string;
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  durationDays: number;
  difficulty: ChallengeDifficulty;
  badgeIcon: string;
  isPublished: boolean;
  createdAt: string;
  activities?: ChallengeActivity[];
  enrollmentCount?: number;
  isEnrolled?: boolean;
  userEnrollment?: ChallengeEnrollment | null;
}

export interface ChallengeEnrollment {
  id: string;
  userId: string;
  challengeId: string;
  status: ChallengeStatus;
  startDate: string;
  completedDate: string | null;
  currentStreak: number;
  completedDays: number[];
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  challenge?: {
    id: string;
    title: string;
    slug: string;
    durationDays: number;
    difficulty: ChallengeDifficulty;
    badgeIcon: string;
    description: string;
  };
  activities?: ChallengeActivity[];
}

export interface ChallengeQueryParams {
  page?: number;
  limit?: number;
  difficulty?: ChallengeDifficulty;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
  isPublished?: boolean;
}

export interface CreateChallengePayload {
  title: string;
  description: string;
  durationDays: number;
  difficulty?: ChallengeDifficulty;
  badgeIcon?: string;
  isPublished?: boolean;
  activities?: ChallengeActivity[];
}

export interface UpdateChallengePayload {
  title?: string;
  description?: string;
  durationDays?: number;
  difficulty?: ChallengeDifficulty;
  badgeIcon?: string;
  isPublished?: boolean;
  activities?: ChallengeActivity[];
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
  activeEnrollments: ChallengeEnrollment[];
  completedEnrollments: ChallengeEnrollment[];
  earnedAchievements: Achievement[];
  totalAchievementsCount: number;
  unlockedAchievementsCount: number;
  nextMilestones: Achievement[];
  encouragementMessage: string;
}

export interface AdminChallengeStats {
  totalChallenges: number;
  publishedChallenges: number;
  totalEnrollments: number;
  completedEnrollments: number;
}
