import { prisma } from '../../config/prisma';
import { Prisma, WellnessTier } from '@prisma/client';
import {
  CreateFocusSessionDTO,
  FocusSessionQueryParams,
  CreateScreenTimeLogDTO,
  UpdateScreenTimeLogDTO,
  ScreenTimeQueryParams,
  UpsertScreenTimeGoalDTO,
  SubmitAssessmentDTO,
  UpsertDailyPlannerDTO,
  UpdateDailyPlannerDTO,
} from './wellness.types';

export class WellnessRepository {
  // ==========================================
  // FOCUS SESSIONS
  // ==========================================
  async createFocusSession(userId: string, data: CreateFocusSessionDTO) {
    return prisma.focusSession.create({
      data: {
        userId,
        sessionType: data.sessionType ?? 'POMODORO',
        durationMinutes: data.durationMinutes,
        intention: data.intention,
        reflection: data.reflection,
        distractionsCount: data.distractionsCount ?? 0,
        focusRating: data.focusRating,
      },
    });
  }

  async findFocusSessions(userId: string, params: FocusSessionQueryParams) {
    const { page = 1, limit = 20, sessionType, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.FocusSessionWhereInput = { userId };
    if (sessionType) where.sessionType = sessionType;

    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) where.completedAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.completedAt.lte = end;
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.focusSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { completedAt: 'desc' },
      }),
      prisma.focusSession.count({ where }),
    ]);

    return { sessions, total };
  }

  async findFocusSessionById(id: string, userId: string) {
    return prisma.focusSession.findFirst({
      where: { id, userId },
    });
  }

  async deleteFocusSession(id: string, userId: string) {
    const session = await prisma.focusSession.findFirst({ where: { id, userId } });
    if (!session) return null;
    await prisma.focusSession.delete({ where: { id } });
    return session;
  }

  async getFocusSummary(userId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const [totalAgg, todayAgg, weekAgg, ratingAgg, sessionsToday] = await Promise.all([
      prisma.focusSession.aggregate({
        where: { userId },
        _count: true,
        _sum: { durationMinutes: true },
      }),
      prisma.focusSession.aggregate({
        where: { userId, completedAt: { gte: todayStart } },
        _sum: { durationMinutes: true },
        _count: true,
      }),
      prisma.focusSession.aggregate({
        where: { userId, completedAt: { gte: weekStart } },
        _sum: { durationMinutes: true },
        _count: true,
      }),
      prisma.focusSession.aggregate({
        where: { userId, focusRating: { not: null } },
        _avg: { focusRating: true },
      }),
      prisma.focusSession.findMany({
        where: { userId, completedAt: { gte: todayStart } },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
    ]);

    // 7-day trend
    const weeklyTrend: { date: string; dayName: string; minutes: number; sessions: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayAgg = await prisma.focusSession.aggregate({
        where: { userId, completedAt: { gte: d, lt: nextD } },
        _sum: { durationMinutes: true },
        _count: true,
      });

      weeklyTrend.push({
        date: d.toISOString().slice(0, 10),
        dayName: dayNames[d.getDay()],
        minutes: dayAgg._sum.durationMinutes ?? 0,
        sessions: dayAgg._count,
      });
    }

    return {
      todayMinutes: todayAgg._sum.durationMinutes ?? 0,
      todaySessions: todayAgg._count,
      weekMinutes: weekAgg._sum.durationMinutes ?? 0,
      weekSessions: weekAgg._count,
      totalMinutes: totalAgg._sum.durationMinutes ?? 0,
      totalSessions: totalAgg._count,
      avgFocusRating: ratingAgg._avg.focusRating ? Math.round(ratingAgg._avg.focusRating * 10) / 10 : null,
      recentSessionsToday: sessionsToday,
      weeklyTrend,
    };
  }

  // ==========================================
  // SCREEN TIME LOGS & GOALS
  // ==========================================
  async upsertScreenTimeLog(userId: string, data: CreateScreenTimeLogDTO) {
    const dateStr = data.logDate || new Date().toISOString().slice(0, 10);
    const logDate = new Date(`${dateStr}T00:00:00.000Z`);

    return prisma.screenTimeLog.upsert({
      where: { userId_logDate: { userId, logDate } },
      create: {
        userId,
        logDate,
        totalMinutes: data.totalMinutes,
        productiveMinutes: data.productiveMinutes ?? 0,
        distractingMinutes: data.distractingMinutes ?? 0,
        pickupsCount: data.pickupsCount ?? 0,
        categoryBreakdown: (data.categoryBreakdown ?? {}) as Prisma.InputJsonValue,
        notes: data.notes,
      },
      update: {
        totalMinutes: data.totalMinutes,
        ...(data.productiveMinutes !== undefined ? { productiveMinutes: data.productiveMinutes } : {}),
        ...(data.distractingMinutes !== undefined ? { distractingMinutes: data.distractingMinutes } : {}),
        ...(data.pickupsCount !== undefined ? { pickupsCount: data.pickupsCount } : {}),
        ...(data.categoryBreakdown !== undefined ? { categoryBreakdown: data.categoryBreakdown as Prisma.InputJsonValue } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });
  }

  async findScreenTimeLogs(userId: string, params: ScreenTimeQueryParams) {
    const { startDate, endDate, limit = 30 } = params;
    const where: Prisma.ScreenTimeLogWhereInput = { userId };

    if (startDate || endDate) {
      where.logDate = {};
      if (startDate) where.logDate.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) where.logDate.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    return prisma.screenTimeLog.findMany({
      where,
      orderBy: { logDate: 'desc' },
      take: limit,
    });
  }

  async findScreenTimeLogById(id: string, userId: string) {
    return prisma.screenTimeLog.findFirst({
      where: { id, userId },
    });
  }

  async updateScreenTimeLog(id: string, userId: string, data: UpdateScreenTimeLogDTO) {
    const existing = await prisma.screenTimeLog.findFirst({ where: { id, userId } });
    if (!existing) return null;

    return prisma.screenTimeLog.update({
      where: { id },
      data: {
        ...(data.totalMinutes !== undefined ? { totalMinutes: data.totalMinutes } : {}),
        ...(data.productiveMinutes !== undefined ? { productiveMinutes: data.productiveMinutes } : {}),
        ...(data.distractingMinutes !== undefined ? { distractingMinutes: data.distractingMinutes } : {}),
        ...(data.pickupsCount !== undefined ? { pickupsCount: data.pickupsCount } : {}),
        ...(data.categoryBreakdown !== undefined ? { categoryBreakdown: data.categoryBreakdown as Prisma.InputJsonValue } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });
  }

  async deleteScreenTimeLog(id: string, userId: string) {
    const existing = await prisma.screenTimeLog.findFirst({ where: { id, userId } });
    if (!existing) return null;

    await prisma.screenTimeLog.delete({ where: { id } });
    return existing;
  }

  async getScreenTimeSummary(userId: string) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

    const [todayLog, goal, allLogs] = await Promise.all([
      prisma.screenTimeLog.findUnique({
        where: { userId_logDate: { userId, logDate: todayDate } },
      }),
      prisma.screenTimeGoal.findUnique({
        where: { userId },
      }),
      prisma.screenTimeLog.findMany({
        where: { userId },
        orderBy: { logDate: 'desc' },
        take: 7,
      }),
    ]);

    const activeGoal = goal || {
      maxDailyMinutes: 360,
      maxDistractingMinutes: 120,
      targetBedtimeHour: 23,
      isActive: true,
    };

    const todayTotal = todayLog?.totalMinutes ?? 0;
    const remainingMinutes = Math.max(0, activeGoal.maxDailyMinutes - todayTotal);
    const isExceeded = todayTotal > activeGoal.maxDailyMinutes;

    // 7-day trend
    const weeklyTrend: { date: string; dayName: string; totalMinutes: number; productiveMinutes: number; distractingMinutes: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const dateStr = d.toISOString().slice(0, 10);
      const log = await prisma.screenTimeLog.findUnique({
        where: { userId_logDate: { userId, logDate: d } },
      });

      weeklyTrend.push({
        date: dateStr,
        dayName: dayNames[d.getUTCDay()],
        totalMinutes: log?.totalMinutes ?? 0,
        productiveMinutes: log?.productiveMinutes ?? 0,
        distractingMinutes: log?.distractingMinutes ?? 0,
      });
    }

    const weeklyTotalMinutes = weeklyTrend.reduce((acc, curr) => acc + curr.totalMinutes, 0);

    return {
      todayLog,
      goal: activeGoal,
      remainingMinutes,
      isExceeded,
      weeklyTrend,
      weeklyTotalMinutes,
      weeklyAvgMinutes: Math.round(weeklyTotalMinutes / 7),
      recentLogs: allLogs,
    };
  }

  async upsertScreenTimeGoal(userId: string, data: UpsertScreenTimeGoalDTO) {
    return prisma.screenTimeGoal.upsert({
      where: { userId },
      create: {
        userId,
        maxDailyMinutes: data.maxDailyMinutes ?? 360,
        maxDistractingMinutes: data.maxDistractingMinutes ?? 120,
        targetBedtimeHour: data.targetBedtimeHour ?? 23,
        isActive: data.isActive ?? true,
      },
      update: {
        ...(data.maxDailyMinutes !== undefined ? { maxDailyMinutes: data.maxDailyMinutes } : {}),
        ...(data.maxDistractingMinutes !== undefined ? { maxDistractingMinutes: data.maxDistractingMinutes } : {}),
        ...(data.targetBedtimeHour !== undefined ? { targetBedtimeHour: data.targetBedtimeHour } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  async findScreenTimeGoal(userId: string) {
    return prisma.screenTimeGoal.findUnique({
      where: { userId },
    });
  }

  // ==========================================
  // WELLNESS ASSESSMENTS
  // ==========================================
  async createAssessment(
    userId: string,
    overallScore: number,
    dimensionScores: Record<string, number>,
    tier: WellnessTier,
    recommendations: string[],
    responses: SubmitAssessmentDTO['responses']
  ) {
    return prisma.wellnessAssessment.create({
      data: {
        userId,
        overallScore,
        dimensionScores: dimensionScores as unknown as Prisma.InputJsonValue,
        responses: responses as unknown as Prisma.InputJsonValue,
        calculatedTier: tier,
        recommendations: recommendations as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async findAssessments(userId: string, limit = 20) {
    return prisma.wellnessAssessment.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }

  async findAssessmentById(id: string, userId: string) {
    return prisma.wellnessAssessment.findFirst({
      where: { id, userId },
    });
  }

  async findLatestAssessment(userId: string) {
    return prisma.wellnessAssessment.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });
  }

  // ==========================================
  // DAILY PLANNER
  // ==========================================
  async upsertDailyPlanner(userId: string, data: UpsertDailyPlannerDTO) {
    const dateStr = data.planDate || new Date().toISOString().slice(0, 10);
    const planDate = new Date(`${dateStr}T00:00:00.000Z`);

    return prisma.dailyPlanner.upsert({
      where: { userId_planDate: { userId, planDate } },
      create: {
        userId,
        planDate,
        digitalIntention: data.digitalIntention,
        priorityTasks: (data.priorityTasks ?? []) as unknown as Prisma.InputJsonValue,
      },
      update: {
        digitalIntention: data.digitalIntention,
        ...(data.priorityTasks !== undefined ? { priorityTasks: data.priorityTasks as unknown as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async findDailyPlannerByDate(userId: string, dateStr: string) {
    const planDate = new Date(`${dateStr}T00:00:00.000Z`);
    return prisma.dailyPlanner.findUnique({
      where: { userId_planDate: { userId, planDate } },
    });
  }

  async updateDailyPlanner(userId: string, dateStr: string, data: UpdateDailyPlannerDTO) {
    const planDate = new Date(`${dateStr}T00:00:00.000Z`);
    const existing = await prisma.dailyPlanner.findUnique({
      where: { userId_planDate: { userId, planDate } },
    });
    if (!existing) return null;

    return prisma.dailyPlanner.update({
      where: { userId_planDate: { userId, planDate } },
      data: {
        ...(data.digitalIntention !== undefined ? { digitalIntention: data.digitalIntention } : {}),
        ...(data.priorityTasks !== undefined ? { priorityTasks: data.priorityTasks as unknown as Prisma.InputJsonValue } : {}),
        ...(data.shutdownCompleted !== undefined
          ? {
              shutdownCompleted: data.shutdownCompleted,
              shutdownAt: data.shutdownCompleted ? new Date() : null,
            }
          : {}),
      },
    });
  }

  async findRecentDailyPlanners(userId: string, limit = 7) {
    return prisma.dailyPlanner.findMany({
      where: { userId },
      orderBy: { planDate: 'desc' },
      take: limit,
    });
  }

  // ==========================================
  // DASHBOARD SUMMARY
  // ==========================================
  async getDashboardSummary(userId: string) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);
    const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6));

    const [
      focusToday,
      focusWeek,
      focusTotal,
      screenToday,
      screenGoal,
      latestAssessment,
      plannerToday,
    ] = await Promise.all([
      prisma.focusSession.aggregate({
        where: { userId, completedAt: { gte: todayDate } },
        _sum: { durationMinutes: true },
        _count: true,
      }),
      prisma.focusSession.aggregate({
        where: { userId, completedAt: { gte: weekStart } },
        _sum: { durationMinutes: true },
        _count: true,
      }),
      prisma.focusSession.aggregate({
        where: { userId },
        _sum: { durationMinutes: true },
        _count: true,
      }),
      prisma.screenTimeLog.findUnique({
        where: { userId_logDate: { userId, logDate: todayDate } },
      }),
      prisma.screenTimeGoal.findUnique({
        where: { userId },
      }),
      prisma.wellnessAssessment.findFirst({
        where: { userId },
        orderBy: { completedAt: 'desc' },
      }),
      prisma.dailyPlanner.findUnique({
        where: { userId_planDate: { userId, planDate: todayDate } },
      }),
    ]);

    const activeGoal = screenGoal || {
      maxDailyMinutes: 360,
      maxDistractingMinutes: 120,
      targetBedtimeHour: 23,
      isActive: true,
    };

    const plannerTasks = (plannerToday?.priorityTasks as Array<{ id: string; text: string; completed: boolean }>) || [];
    const completedTasksCount = plannerTasks.filter((t) => t.completed).length;

    return {
      focus: {
        todayMinutes: focusToday._sum.durationMinutes ?? 0,
        todaySessions: focusToday._count,
        weekMinutes: focusWeek._sum.durationMinutes ?? 0,
        weekSessions: focusWeek._count,
        totalMinutes: focusTotal._sum.durationMinutes ?? 0,
        totalSessions: focusTotal._count,
      },
      screenTime: {
        todayMinutes: screenToday?.totalMinutes ?? 0,
        productiveMinutes: screenToday?.productiveMinutes ?? 0,
        distractingMinutes: screenToday?.distractingMinutes ?? 0,
        pickupsCount: screenToday?.pickupsCount ?? 0,
        goal: activeGoal,
        remainingMinutes: Math.max(0, activeGoal.maxDailyMinutes - (screenToday?.totalMinutes ?? 0)),
        isExceeded: (screenToday?.totalMinutes ?? 0) > activeGoal.maxDailyMinutes,
      },
      assessment: latestAssessment
        ? {
            id: latestAssessment.id,
            overallScore: latestAssessment.overallScore,
            tier: latestAssessment.calculatedTier,
            completedAt: latestAssessment.completedAt,
            recommendations: latestAssessment.recommendations,
          }
        : null,
      planner: plannerToday
        ? {
            id: plannerToday.id,
            planDate: todayStr,
            digitalIntention: plannerToday.digitalIntention,
            totalTasks: plannerTasks.length,
            completedTasks: completedTasksCount,
            pendingTasks: plannerTasks.length - completedTasksCount,
            shutdownCompleted: plannerToday.shutdownCompleted,
            shutdownAt: plannerToday.shutdownAt,
            tasks: plannerTasks,
          }
        : null,
    };
  }
}

export const wellnessRepository = new WellnessRepository();
