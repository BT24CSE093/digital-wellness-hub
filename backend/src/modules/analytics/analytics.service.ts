import { prisma } from '../../config/prisma';

export class AnalyticsService {
  async getDashboardSummary(userId: string) {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const [
      focusToday,
      focusWeek,
      focusTotal,
      screenToday,
      latestAssessment,
      planToday,
    ] = await Promise.all([
      prisma.focusSession.aggregate({ where: { userId, completedAt: { gte: todayStart } }, _sum: { durationMinutes: true }, _count: true }),
      prisma.focusSession.aggregate({ where: { userId, completedAt: { gte: weekStart } }, _sum: { durationMinutes: true }, _count: true }),
      prisma.focusSession.aggregate({ where: { userId }, _sum: { durationMinutes: true }, _count: true }),
      prisma.screenTimeLog.findUnique({ where: { userId_logDate: { userId, logDate: todayStart } } }),
      prisma.wellnessAssessment.findFirst({ where: { userId }, orderBy: { completedAt: 'desc' } }),
      prisma.dailyPlanner.findUnique({ where: { userId_planDate: { userId, planDate: todayStart } } }),
    ]);

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
        todayMinutes: screenToday?.totalMinutes ?? null,
        todayProductiveMinutes: screenToday?.productiveMinutes ?? null,
        todayDistractingMinutes: screenToday?.distractingMinutes ?? null,
      },
      wellness: latestAssessment
        ? {
            overallScore: latestAssessment.overallScore,
            tier: latestAssessment.calculatedTier,
            completedAt: latestAssessment.completedAt,
          }
        : null,
      planner: planToday
        ? {
            intention: planToday.digitalIntention,
            tasksTotal: (planToday.priorityTasks as { id: string; text: string; completed: boolean }[]).length,
            tasksCompleted: (planToday.priorityTasks as { id: string; text: string; completed: boolean }[]).filter((t) => t.completed).length,
            shutdownCompleted: planToday.shutdownCompleted,
          }
        : null,
    };
  }

  async getWeeklyFocusTrend(userId: string) {
    const now = new Date();
    const result: { date: string; totalMinutes: number; sessions: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const agg = await prisma.focusSession.aggregate({
        where: { userId, completedAt: { gte: day, lt: nextDay } },
        _sum: { durationMinutes: true },
        _count: true,
      });
      result.push({ date: day.toISOString().slice(0, 10), totalMinutes: agg._sum.durationMinutes ?? 0, sessions: agg._count });
    }
    return result;
  }

  async getWeeklyScreenTimeTrend(userId: string) {
    const now = new Date();
    const result: { date: string; totalMinutes: number; productiveMinutes: number; distractingMinutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const dateStr = day.toISOString().slice(0, 10);
      const log = await prisma.screenTimeLog.findUnique({ where: { userId_logDate: { userId, logDate: day } } });
      result.push({ date: dateStr, totalMinutes: log?.totalMinutes ?? 0, productiveMinutes: log?.productiveMinutes ?? 0, distractingMinutes: log?.distractingMinutes ?? 0 });
    }
    return result;
  }
}

export const analyticsService = new AnalyticsService();
