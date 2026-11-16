import { prisma } from '../../config/prisma';
import { CreateFocusSessionDTO, FocusSessionQueryParams } from './focus.types';

export class FocusRepository {
  async create(userId: string, data: CreateFocusSessionDTO) {
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

  async findMany(userId: string, params: FocusSessionQueryParams) {
    const { page = 1, limit = 20, sessionType, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: { userId: string; sessionType?: typeof sessionType; completedAt?: { gte?: Date; lte?: Date } } = { userId };
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
      prisma.focusSession.findMany({ where, skip, take: limit, orderBy: { completedAt: 'desc' } }),
      prisma.focusSession.count({ where }),
    ]);
    return { sessions, total };
  }

  async findById(id: string, userId: string) {
    return prisma.focusSession.findFirst({ where: { id, userId } });
  }

  async delete(id: string, userId: string) {
    return prisma.focusSession.deleteMany({ where: { id, userId } });
  }

  async getStats(userId: string): Promise<{
    totalSessions: number;
    totalMinutes: number;
    todayMinutes: number;
    weekMinutes: number;
    avgFocusRating: number | null;
    avgDistractions: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const [all, today, week, ratingAgg, distractionAgg] = await Promise.all([
      prisma.focusSession.aggregate({ where: { userId }, _count: true, _sum: { durationMinutes: true } }),
      prisma.focusSession.aggregate({ where: { userId, completedAt: { gte: todayStart } }, _sum: { durationMinutes: true } }),
      prisma.focusSession.aggregate({ where: { userId, completedAt: { gte: weekStart } }, _sum: { durationMinutes: true } }),
      prisma.focusSession.aggregate({ where: { userId, focusRating: { not: null } }, _avg: { focusRating: true } }),
      prisma.focusSession.aggregate({ where: { userId }, _avg: { distractionsCount: true } }),
    ]);

    return {
      totalSessions: all._count,
      totalMinutes: all._sum.durationMinutes ?? 0,
      todayMinutes: today._sum.durationMinutes ?? 0,
      weekMinutes: week._sum.durationMinutes ?? 0,
      avgFocusRating: ratingAgg._avg.focusRating ? Math.round(ratingAgg._avg.focusRating * 10) / 10 : null,
      avgDistractions: Math.round((distractionAgg._avg.distractionsCount ?? 0) * 10) / 10,
    };
  }

  async getWeeklyTrend(userId: string) {
    const days: { date: string; totalMinutes: number; sessions: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const agg = await prisma.focusSession.aggregate({
        where: { userId, completedAt: { gte: day, lt: nextDay } },
        _sum: { durationMinutes: true },
        _count: true,
      });
      days.push({
        date: day.toISOString().slice(0, 10),
        totalMinutes: agg._sum.durationMinutes ?? 0,
        sessions: agg._count,
      });
    }
    return days;
  }
}

export const focusRepository = new FocusRepository();
