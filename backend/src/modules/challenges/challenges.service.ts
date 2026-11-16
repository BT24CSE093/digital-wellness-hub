import { prisma } from '../../config/prisma';
import { challengesRepository } from './challenges.repository';
import {
  ChallengeActivity,
  ChallengeDetail,
  ChallengeEnrollmentSummary,
  ChallengeQueryParams,
  CreateChallengeDTO,
  UpdateChallengeDTO,
  UpdateProgressDTO,
  Achievement,
  GamificationDashboard,
} from './challenges.types';
import { AppError } from '../../middleware/errorHandler';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parses structured activities stored in challenge description or generates default daily activities
 */
function resolveActivities(
  description: string,
  durationDays: number,
  title: string
): { overview: string; activities: ChallengeActivity[] } {
  try {
    if (description.startsWith('{') && description.endsWith('}')) {
      const parsed = JSON.parse(description);
      if (Array.isArray(parsed.activities)) {
        return {
          overview: parsed.overview || parsed.description || description,
          activities: parsed.activities,
        };
      }
    }
  } catch {
    // Description is plain text or Markdown
  }

  // Generate activities based on challenge title and duration
  const activities: ChallengeActivity[] = [];
  for (let day = 1; day <= durationDays; day++) {
    activities.push({
      day,
      title: `Day ${day}: Mindful Action for ${title}`,
      instructions: `Complete today's daily focus session, reflect on your device habits, and execute your intentional digital boundary.`,
    });
  }

  return { overview: description, activities };
}

export class ChallengesService {
  // ==========================================
  // PUBLIC CHALLENGES
  // ==========================================
  async listChallenges(
    params: ChallengeQueryParams,
    currentUserId?: string
  ): Promise<{ challenges: ChallengeDetail[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const { challenges: rawList, total } = await challengesRepository.findMany({
      ...params,
      isPublished: params.isPublished !== undefined ? params.isPublished : true,
    });

    let userEnrollmentMap: Record<string, ChallengeEnrollmentSummary> = {};
    if (currentUserId) {
      const userEnrollments = await challengesRepository.findEnrollmentsByUser(currentUserId);
      for (const e of userEnrollments) {
        const completed = (e.completedDays as number[]) || [];
        userEnrollmentMap[e.challengeId] = {
          id: e.id,
          userId: e.userId,
          challengeId: e.challengeId,
          status: e.status,
          startDate: e.startDate,
          completedDate: e.completedDate,
          currentStreak: e.currentStreak,
          completedDays: completed,
          progressPercentage: Math.min(100, Math.round((completed.length / e.challenge.durationDays) * 100)),
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        };
      }
    }

    const challenges: ChallengeDetail[] = rawList.map((c) => {
      const { overview, activities } = resolveActivities(c.description, c.durationDays, c.title);
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: overview,
        durationDays: c.durationDays,
        difficulty: c.difficulty,
        badgeIcon: c.badgeIcon,
        isPublished: c.isPublished,
        createdAt: c.createdAt,
        activities,
        enrollmentCount: c._count.enrollments,
        isEnrolled: Boolean(userEnrollmentMap[c.id]),
        userEnrollment: userEnrollmentMap[c.id] || null,
      };
    });

    return {
      challenges,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChallengeDetail(idOrSlug: string, currentUserId?: string): Promise<ChallengeDetail | null> {
    const c = await challengesRepository.findByIdOrSlug(idOrSlug);
    if (!c) return null;

    const { overview, activities } = resolveActivities(c.description, c.durationDays, c.title);

    let isEnrolled = false;
    let userEnrollment: ChallengeEnrollmentSummary | null = null;

    if (currentUserId) {
      const enrollment = await challengesRepository.findEnrollmentByUserAndChallenge(currentUserId, c.id);
      if (enrollment) {
        isEnrolled = true;
        const completed = (enrollment.completedDays as number[]) || [];
        userEnrollment = {
          id: enrollment.id,
          userId: enrollment.userId,
          challengeId: enrollment.challengeId,
          status: enrollment.status,
          startDate: enrollment.startDate,
          completedDate: enrollment.completedDate,
          currentStreak: enrollment.currentStreak,
          completedDays: completed,
          progressPercentage: Math.min(100, Math.round((completed.length / c.durationDays) * 100)),
          createdAt: enrollment.createdAt,
          updatedAt: enrollment.updatedAt,
        };
      }
    }

    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: overview,
      durationDays: c.durationDays,
      difficulty: c.difficulty,
      badgeIcon: c.badgeIcon,
      isPublished: c.isPublished,
      createdAt: c.createdAt,
      activities,
      enrollmentCount: c._count.enrollments,
      isEnrolled,
      userEnrollment,
    };
  }

  // ==========================================
  // STUDENT ENROLLMENT & PARTICIPATION
  // ==========================================
  async enroll(userId: string, challengeIdOrSlug: string): Promise<ChallengeEnrollmentSummary> {
    const challenge = await challengesRepository.findByIdOrSlug(challengeIdOrSlug);
    if (!challenge) {
      throw new AppError('Challenge not found.', 404, 'NOT_FOUND');
    }

    if (!challenge.isPublished) {
      throw new AppError('This challenge is currently unavailable for enrollment.', 400, 'CHALLENGE_UNAVAILABLE');
    }

    // Check duplicate enrollment
    const existing = await challengesRepository.findEnrollmentByUserAndChallenge(userId, challenge.id);
    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw new AppError('You are already actively enrolled in this challenge.', 409, 'ALREADY_ENROLLED');
      }
      // Re-activate if previously abandoned
      const reactivated = await challengesRepository.updateEnrollment(existing.id, {
        status: 'ACTIVE',
      });
      const completed = (reactivated.completedDays as number[]) || [];
      return {
        id: reactivated.id,
        userId: reactivated.userId,
        challengeId: reactivated.challengeId,
        status: reactivated.status,
        startDate: reactivated.startDate,
        completedDate: reactivated.completedDate,
        currentStreak: reactivated.currentStreak,
        completedDays: completed,
        progressPercentage: Math.min(100, Math.round((completed.length / challenge.durationDays) * 100)),
        createdAt: reactivated.createdAt,
        updatedAt: reactivated.updatedAt,
        challenge: {
          id: challenge.id,
          title: challenge.title,
          slug: challenge.slug,
          durationDays: challenge.durationDays,
          difficulty: challenge.difficulty,
          badgeIcon: challenge.badgeIcon,
          description: challenge.description,
        },
      };
    }

    const created = await challengesRepository.createEnrollment(userId, challenge.id);
    return {
      id: created.id,
      userId: created.userId,
      challengeId: created.challengeId,
      status: created.status,
      startDate: created.startDate,
      completedDate: created.completedDate,
      currentStreak: created.currentStreak,
      completedDays: [],
      progressPercentage: 0,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        slug: challenge.slug,
        durationDays: challenge.durationDays,
        difficulty: challenge.difficulty,
        badgeIcon: challenge.badgeIcon,
        description: challenge.description,
      },
    };
  }

  async cancelEnrollment(userId: string, challengeIdOrSlug: string): Promise<void> {
    const challenge = await challengesRepository.findByIdOrSlug(challengeIdOrSlug);
    if (!challenge) {
      throw new AppError('Challenge not found.', 404, 'NOT_FOUND');
    }

    const enrollment = await challengesRepository.findEnrollmentByUserAndChallenge(userId, challenge.id);
    if (!enrollment) {
      throw new AppError('You are not currently enrolled in this challenge.', 404, 'ENROLLMENT_NOT_FOUND');
    }

    await challengesRepository.deleteEnrollment(enrollment.id, userId);
  }

  async listMyEnrollments(userId: string): Promise<ChallengeEnrollmentSummary[]> {
    const rawList = await challengesRepository.findEnrollmentsByUser(userId);
    return rawList.map((e) => {
      const completed = (e.completedDays as number[]) || [];
      const duration = e.challenge.durationDays;
      return {
        id: e.id,
        userId: e.userId,
        challengeId: e.challengeId,
        status: e.status,
        startDate: e.startDate,
        completedDate: e.completedDate,
        currentStreak: e.currentStreak,
        completedDays: completed,
        progressPercentage: Math.min(100, Math.round((completed.length / (duration || 1)) * 100)),
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        challenge: {
          id: e.challenge.id,
          title: e.challenge.title,
          slug: e.challenge.slug,
          durationDays: e.challenge.durationDays,
          difficulty: e.challenge.difficulty,
          badgeIcon: e.challenge.badgeIcon,
          description: e.challenge.description,
        },
      };
    });
  }

  async getMyEnrollmentDetail(enrollmentId: string, userId: string): Promise<ChallengeEnrollmentSummary & { activities: ChallengeActivity[] }> {
    const enrollment = await challengesRepository.findEnrollmentById(enrollmentId, userId);
    if (!enrollment) {
      throw new AppError('Challenge enrollment not found or inaccessible.', 404, 'NOT_FOUND');
    }

    const { activities } = resolveActivities(
      enrollment.challenge.description,
      enrollment.challenge.durationDays,
      enrollment.challenge.title
    );

    const completed = (enrollment.completedDays as number[]) || [];
    const duration = enrollment.challenge.durationDays;

    return {
      id: enrollment.id,
      userId: enrollment.userId,
      challengeId: enrollment.challengeId,
      status: enrollment.status,
      startDate: enrollment.startDate,
      completedDate: enrollment.completedDate,
      currentStreak: enrollment.currentStreak,
      completedDays: completed,
      progressPercentage: Math.min(100, Math.round((completed.length / (duration || 1)) * 100)),
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      challenge: {
        id: enrollment.challenge.id,
        title: enrollment.challenge.title,
        slug: enrollment.challenge.slug,
        durationDays: enrollment.challenge.durationDays,
        difficulty: enrollment.challenge.difficulty,
        badgeIcon: enrollment.challenge.badgeIcon,
        description: enrollment.challenge.description,
      },
      activities,
    };
  }

  async updateProgress(enrollmentId: string, userId: string, data: UpdateProgressDTO): Promise<ChallengeEnrollmentSummary> {
    const enrollment = await challengesRepository.findEnrollmentById(enrollmentId, userId);
    if (!enrollment) {
      throw new AppError('Challenge enrollment not found or inaccessible.', 404, 'NOT_FOUND');
    }

    if (data.dayNumber < 1 || data.dayNumber > enrollment.challenge.durationDays) {
      throw new AppError(
        `Day number must be between 1 and ${enrollment.challenge.durationDays}.`,
        422,
        'VALIDATION_ERROR'
      );
    }

    let completedDays: number[] = Array.isArray(enrollment.completedDays)
      ? [...(enrollment.completedDays as number[])]
      : [];

    const shouldComplete = data.completed !== undefined ? data.completed : true;

    if (shouldComplete) {
      if (!completedDays.includes(data.dayNumber)) {
        completedDays.push(data.dayNumber);
        completedDays.sort((a, b) => a - b);
      }
    } else {
      completedDays = completedDays.filter((d) => d !== data.dayNumber);
    }

    const isAllFinished = completedDays.length >= enrollment.challenge.durationDays;
    const status = isAllFinished ? 'COMPLETED' : 'ACTIVE';
    const completedDate = isAllFinished ? new Date() : null;
    const currentStreak = completedDays.length;

    const updated = await challengesRepository.updateEnrollment(enrollment.id, {
      completedDays,
      status,
      completedDate,
      currentStreak,
    });

    return {
      id: updated.id,
      userId: updated.userId,
      challengeId: updated.challengeId,
      status: updated.status,
      startDate: updated.startDate,
      completedDate: updated.completedDate,
      currentStreak: updated.currentStreak,
      completedDays,
      progressPercentage: Math.min(100, Math.round((completedDays.length / updated.challenge.durationDays) * 100)),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      challenge: {
        id: updated.challenge.id,
        title: updated.challenge.title,
        slug: updated.challenge.slug,
        durationDays: updated.challenge.durationDays,
        difficulty: updated.challenge.difficulty,
        badgeIcon: updated.challenge.badgeIcon,
        description: updated.challenge.description,
      },
    };
  }

  // ==========================================
  // PRIVACY-CONSCIOUS ACHIEVEMENTS ENGINE
  // ==========================================
  async getAchievements(userId: string): Promise<Achievement[]> {
    // Fetch verified user actions across database
    const [
      focusCount,
      focusAgg,
      screenTimeCount,
      assessmentCount,
      latestAssessment,
      plannerCount,
      shutdownCount,
      enrollmentCount,
      completedChallengesCount,
    ] = await Promise.all([
      prisma.focusSession.count({ where: { userId } }),
      prisma.focusSession.aggregate({ where: { userId }, _sum: { durationMinutes: true } }),
      prisma.screenTimeLog.count({ where: { userId } }),
      prisma.wellnessAssessment.count({ where: { userId } }),
      prisma.wellnessAssessment.findFirst({ where: { userId }, orderBy: { completedAt: 'desc' } }),
      prisma.dailyPlanner.count({ where: { userId } }),
      prisma.dailyPlanner.count({ where: { userId, shutdownCompleted: true } }),
      prisma.challengeEnrollment.count({ where: { userId } }),
      prisma.challengeEnrollment.count({ where: { userId, status: 'COMPLETED' } }),
    ]);

    const totalFocusMinutes = focusAgg._sum.durationMinutes ?? 0;
    const assessmentScore = latestAssessment?.overallScore ?? 0;

    const definitions: Array<{
      id: string;
      title: string;
      description: string;
      category: Achievement['category'];
      badgeIcon: string;
      progress: number;
      maxProgress: number;
    }> = [
      {
        id: 'first_focus_sprint',
        title: 'Focus Sprint Initiate',
        description: 'Completed your first 25-minute Pomodoro deep work sprint.',
        category: 'FOCUS',
        badgeIcon: 'Clock',
        progress: Math.min(1, focusCount),
        maxProgress: 1,
      },
      {
        id: 'five_focus_sprints',
        title: 'Flow Seeker',
        description: 'Completed 5 deep work sprints without external interruption.',
        category: 'FOCUS',
        badgeIcon: 'Flame',
        progress: Math.min(5, focusCount),
        maxProgress: 5,
      },
      {
        id: 'deep_work_master',
        title: 'Deep Flow Master',
        description: 'Accumulated over 250 minutes of deep study sessions.',
        category: 'FOCUS',
        badgeIcon: 'Award',
        progress: Math.min(250, totalFocusMinutes),
        maxProgress: 250,
      },
      {
        id: 'first_screen_time_log',
        title: 'Mindful Observer',
        description: 'Logged your first conscious daily screen-time report.',
        category: 'SCREEN_TIME',
        badgeIcon: 'Smartphone',
        progress: Math.min(1, screenTimeCount),
        maxProgress: 1,
      },
      {
        id: 'screen_time_awareness',
        title: 'Screen-Time Awareness Milestone',
        description: 'Logged self-reported screen time across 5 distinct days.',
        category: 'SCREEN_TIME',
        badgeIcon: 'TrendingDown',
        progress: Math.min(5, screenTimeCount),
        maxProgress: 5,
      },
      {
        id: 'first_assessment',
        title: 'Reflective Scholar',
        description: 'Completed your initial Digital Wellness Diagnostic Assessment.',
        category: 'ASSESSMENT',
        badgeIcon: 'Sparkles',
        progress: Math.min(1, assessmentCount),
        maxProgress: 1,
      },
      {
        id: 'digital_balance_milestone',
        title: 'Digital Balance Milestone',
        description: 'Achieved an optimal wellness rating (score 75+) on your assessment.',
        category: 'ASSESSMENT',
        badgeIcon: 'ShieldCheck',
        progress: assessmentScore >= 75 ? 1 : 0,
        maxProgress: 1,
      },
      {
        id: 'daily_planner_starter',
        title: 'Daily Architect',
        description: 'Crafted your first daily digital intention and priority study tasks.',
        category: 'PLANNER',
        badgeIcon: 'CheckSquare',
        progress: Math.min(1, plannerCount),
        maxProgress: 1,
      },
      {
        id: 'planner_habit_builder',
        title: 'Planner Habit Builder',
        description: 'Actively planned your digital day across 7 separate days.',
        category: 'PLANNER',
        badgeIcon: 'Calendar',
        progress: Math.min(7, plannerCount),
        maxProgress: 7,
      },
      {
        id: 'shutdown_champion',
        title: 'Digital Sunset Champion',
        description: 'Successfully completed the evening digital shutdown routine 3 times.',
        category: 'PLANNER',
        badgeIcon: 'Moon',
        progress: Math.min(3, shutdownCount),
        maxProgress: 3,
      },
      {
        id: 'challenge_pioneer',
        title: 'Challenge Pioneer',
        description: 'Enrolled in your first structured digital wellness habit challenge.',
        category: 'CHALLENGE',
        badgeIcon: 'Compass',
        progress: Math.min(1, enrollmentCount),
        maxProgress: 1,
      },
      {
        id: 'challenge_finisher',
        title: 'Habit Victor',
        description: 'Successfully completed every single day of a wellness challenge.',
        category: 'CHALLENGE',
        badgeIcon: 'Award',
        progress: Math.min(1, completedChallengesCount),
        maxProgress: 1,
      },
    ];

    return definitions.map((def) => {
      const isUnlocked = def.progress >= def.maxProgress;
      const percentage = Math.round((def.progress / def.maxProgress) * 100);
      return {
        id: def.id,
        title: def.title,
        description: def.description,
        category: def.category,
        badgeIcon: def.badgeIcon,
        isUnlocked,
        unlockedAt: isUnlocked ? new Date().toISOString() : null,
        progress: def.progress,
        maxProgress: def.maxProgress,
        percentage,
      };
    });
  }

  // ==========================================
  // STUDENT GAMIFICATION DASHBOARD
  // ==========================================
  async getGamificationDashboard(userId: string): Promise<GamificationDashboard> {
    const [allEnrollments, achievements] = await Promise.all([
      this.listMyEnrollments(userId),
      this.getAchievements(userId),
    ]);

    const activeEnrollments = allEnrollments.filter((e) => e.status === 'ACTIVE');
    const completedEnrollments = allEnrollments.filter((e) => e.status === 'COMPLETED');
    const earnedAchievements = achievements.filter((a) => a.isUnlocked);
    const nextMilestones = achievements.filter((a) => !a.isUnlocked).slice(0, 3);

    const encouragingMessages = [
      'Small, consistent boundaries lead to lifelong attention stamina.',
      'Progress in digital wellness is measured in presence, not perfection.',
      'Every intentional choice creates more headspace for your real priorities.',
      'Notice your urge to check feeds, breathe, and choose your next action with intention.',
    ];
    const encouragementMessage =
      encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

    return {
      activeEnrollments,
      completedEnrollments,
      earnedAchievements,
      totalAchievementsCount: achievements.length,
      unlockedAchievementsCount: earnedAchievements.length,
      nextMilestones,
      encouragementMessage,
    };
  }

  // ==========================================
  // ADMIN MANAGEMENT
  // ==========================================
  async createChallenge(data: CreateChallengeDTO) {
    const slug = slugify(data.title);
    const existing = await challengesRepository.findByIdOrSlug(slug);
    if (existing) {
      throw new AppError('A challenge with a similar title or slug already exists.', 409, 'SLUG_CONFLICT');
    }

    let serializedDescription = data.description;
    if (data.activities && data.activities.length > 0) {
      serializedDescription = JSON.stringify({
        overview: data.description,
        activities: data.activities,
      });
    }

    return challengesRepository.create({
      ...data,
      slug,
      serializedDescription,
    });
  }

  async updateChallenge(id: string, data: UpdateChallengeDTO) {
    const existing = await challengesRepository.findByIdOrSlug(id);
    if (!existing) {
      throw new AppError('Challenge not found.', 404, 'NOT_FOUND');
    }

    let serializedDescription: string | undefined = undefined;
    if (data.activities && data.activities.length > 0) {
      serializedDescription = JSON.stringify({
        overview: data.description || existing.description,
        activities: data.activities,
      });
    } else if (data.description !== undefined) {
      serializedDescription = data.description;
    }

    return challengesRepository.update(id, {
      ...data,
      serializedDescription,
    });
  }

  async togglePublish(id: string) {
    const existing = await challengesRepository.findByIdOrSlug(id);
    if (!existing) {
      throw new AppError('Challenge not found.', 404, 'NOT_FOUND');
    }

    return challengesRepository.update(id, {
      isPublished: !existing.isPublished,
    });
  }

  async deleteChallenge(id: string) {
    const existing = await challengesRepository.findByIdOrSlug(id);
    if (!existing) {
      throw new AppError('Challenge not found.', 404, 'NOT_FOUND');
    }

    return challengesRepository.delete(id);
  }

  async getAdminStats() {
    return challengesRepository.getAdminStats();
  }
}

export const challengesService = new ChallengesService();
