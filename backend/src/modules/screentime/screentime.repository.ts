import { prisma } from '../../config/prisma';
import { UpsertScreenTimeLogDTO, UpsertScreenTimeGoalDTO, ScreenTimeQueryParams } from './screentime.types';

export class ScreenTimeRepository {
  async upsertLog(userId: string, data: UpsertScreenTimeLogDTO) {
    const logDate = new Date(data.logDate + 'T00:00:00.000Z');
    return prisma.screenTimeLog.upsert({
      where: { userId_logDate: { userId, logDate } },
      create: {
        userId,
        logDate,
        totalMinutes: data.totalMinutes,
        productiveMinutes: data.productiveMinutes ?? 0,
        distractingMinutes: data.distractingMinutes ?? 0,
        pickupsCount: data.pickupsCount ?? 0,
        categoryBreakdown: data.categoryBreakdown,
        notes: data.notes,
      },
      update: {
        totalMinutes: data.totalMinutes,
        productiveMinutes: data.productiveMinutes ?? 0,
        distractingMinutes: data.distractingMinutes ?? 0,
        pickupsCount: data.pickupsCount ?? 0,
        categoryBreakdown: data.categoryBreakdown,
        notes: data.notes,
      },
    });
  }

  async findLogs(userId: string, params: ScreenTimeQueryParams) {
    const { startDate, endDate, limit = 30 } = params;
    const where: { userId: string; logDate?: { gte?: Date; lte?: Date } } = { userId };
    if (startDate || endDate) {
      where.logDate = {};
      if (startDate) where.logDate.gte = new Date(startDate + 'T00:00:00.000Z');
      if (endDate) where.logDate.lte = new Date(endDate + 'T23:59:59.999Z');
    }
    return prisma.screenTimeLog.findMany({
      where,
      orderBy: { logDate: 'desc' },
      take: limit,
    });
  }

  async findTodayLog(userId: string) {
    const today = new Date();
    const logDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    return prisma.screenTimeLog.findUnique({ where: { userId_logDate: { userId, logDate } } });
  }

  async upsertGoal(userId: string, data: UpsertScreenTimeGoalDTO) {
    return prisma.screenTimeGoal.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async findGoal(userId: string) {
    return prisma.screenTimeGoal.findUnique({ where: { userId } });
  }

  async getWeeklyStats(userId: string) {
    const days: { date: string; totalMinutes: number; productiveMinutes: number; distractingMinutes: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const dateStr = day.toISOString().slice(0, 10);
      const log = await prisma.screenTimeLog.findUnique({ where: { userId_logDate: { userId, logDate: day } } });
      days.push({
        date: dateStr,
        totalMinutes: log?.totalMinutes ?? 0,
        productiveMinutes: log?.productiveMinutes ?? 0,
        distractingMinutes: log?.distractingMinutes ?? 0,
      });
    }
    return days;
  }
}

export const screenTimeRepository = new ScreenTimeRepository();
