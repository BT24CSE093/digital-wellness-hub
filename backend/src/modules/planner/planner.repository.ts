import { prisma } from '../../config/prisma';
import { UpsertPlannerDTO, UpdatePlannerDTO } from './planner.types';

export class PlannerRepository {
  async upsert(userId: string, data: UpsertPlannerDTO) {
    const planDate = new Date(data.planDate + 'T00:00:00.000Z');
    return prisma.dailyPlanner.upsert({
      where: { userId_planDate: { userId, planDate } },
      create: {
        userId,
        planDate,
        digitalIntention: data.digitalIntention,
        priorityTasks: (data.priorityTasks ?? []) as object,
      },
      update: {
        digitalIntention: data.digitalIntention,
        priorityTasks: (data.priorityTasks ?? []) as object,
      },
    });
  }

  async findByDate(userId: string, dateStr: string) {
    const planDate = new Date(dateStr + 'T00:00:00.000Z');
    return prisma.dailyPlanner.findUnique({ where: { userId_planDate: { userId, planDate } } });
  }

  async findRecent(userId: string, limit = 7) {
    return prisma.dailyPlanner.findMany({
      where: { userId },
      orderBy: { planDate: 'desc' },
      take: limit,
    });
  }

  async update(userId: string, dateStr: string, data: UpdatePlannerDTO) {
    const planDate = new Date(dateStr + 'T00:00:00.000Z');
    const existing = await prisma.dailyPlanner.findUnique({ where: { userId_planDate: { userId, planDate } } });
    if (!existing) return null;
    return prisma.dailyPlanner.update({
      where: { userId_planDate: { userId, planDate } },
      data: {
        ...(data.digitalIntention !== undefined ? { digitalIntention: data.digitalIntention } : {}),
        ...(data.priorityTasks !== undefined ? { priorityTasks: data.priorityTasks as object } : {}),
        ...(data.shutdownCompleted !== undefined
          ? {
              shutdownCompleted: data.shutdownCompleted,
              shutdownAt: data.shutdownCompleted ? new Date() : null,
            }
          : {}),
      },
    });
  }
}

export const plannerRepository = new PlannerRepository();
