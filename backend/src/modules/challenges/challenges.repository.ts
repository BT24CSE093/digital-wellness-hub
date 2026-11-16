import { prisma } from '../../config/prisma';
import { Prisma, ChallengeStatus } from '@prisma/client';
import {
  ChallengeQueryParams,
  CreateChallengeDTO,
  UpdateChallengeDTO,
} from './challenges.types';

export class ChallengesRepository {
  // ==========================================
  // CHALLENGES
  // ==========================================
  async findMany(params: ChallengeQueryParams) {
    const {
      page = 1,
      limit = 20,
      difficulty,
      minDuration,
      maxDuration,
      search,
      isPublished,
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.ChallengeWhereInput = {};

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (minDuration || maxDuration) {
      where.durationDays = {};
      if (minDuration) where.durationDays.gte = minDuration;
      if (maxDuration) where.durationDays.lte = maxDuration;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ difficulty: 'asc' }, { durationDays: 'asc' }],
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
      }),
      prisma.challenge.count({ where }),
    ]);

    return { challenges, total };
  }

  async findByIdOrSlug(idOrSlug: string) {
    return prisma.challenge.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async create(data: CreateChallengeDTO & { slug: string; serializedDescription: string }) {
    return prisma.challenge.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.serializedDescription,
        durationDays: data.durationDays,
        difficulty: data.difficulty ?? 'BEGINNER',
        badgeIcon: data.badgeIcon ?? 'Award',
        isPublished: data.isPublished ?? true,
      },
    });
  }

  async update(id: string, data: UpdateChallengeDTO & { serializedDescription?: string }) {
    const updateData: Prisma.ChallengeUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.serializedDescription !== undefined) updateData.description = data.serializedDescription;
    if (data.durationDays !== undefined) updateData.durationDays = data.durationDays;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.badgeIcon !== undefined) updateData.badgeIcon = data.badgeIcon;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    return prisma.challenge.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.challenge.delete({
      where: { id },
    });
  }

  // ==========================================
  // ENROLLMENTS
  // ==========================================
  async findEnrollmentsByUser(userId: string, status?: ChallengeStatus) {
    const where: Prisma.ChallengeEnrollmentWhereInput = { userId };
    if (status) {
      where.status = status;
    }

    return prisma.challengeEnrollment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        challenge: true,
      },
    });
  }

  async findEnrollmentById(id: string, userId: string) {
    return prisma.challengeEnrollment.findFirst({
      where: { id, userId },
      include: {
        challenge: true,
      },
    });
  }

  async findEnrollmentByUserAndChallenge(userId: string, challengeId: string) {
    return prisma.challengeEnrollment.findUnique({
      where: {
        userId_challengeId: { userId, challengeId },
      },
      include: {
        challenge: true,
      },
    });
  }

  async createEnrollment(userId: string, challengeId: string) {
    const now = new Date();
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    return prisma.challengeEnrollment.create({
      data: {
        userId,
        challengeId,
        status: 'ACTIVE',
        startDate,
        completedDays: [],
        currentStreak: 0,
      },
      include: {
        challenge: true,
      },
    });
  }

  async updateEnrollment(
    id: string,
    data: {
      status?: ChallengeStatus;
      completedDays?: number[];
      currentStreak?: number;
      completedDate?: Date | null;
    }
  ) {
    const updateData: Prisma.ChallengeEnrollmentUpdateInput = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.currentStreak !== undefined) updateData.currentStreak = data.currentStreak;
    if (data.completedDate !== undefined) updateData.completedDate = data.completedDate;
    if (data.completedDays !== undefined) {
      updateData.completedDays = data.completedDays as unknown as Prisma.InputJsonValue;
    }

    return prisma.challengeEnrollment.update({
      where: { id },
      data: updateData,
      include: {
        challenge: true,
      },
    });
  }

  async deleteEnrollment(id: string, userId: string) {
    const existing = await prisma.challengeEnrollment.findFirst({ where: { id, userId } });
    if (!existing) return null;

    await prisma.challengeEnrollment.delete({ where: { id } });
    return existing;
  }

  // ==========================================
  // ADMIN STATS
  // ==========================================
  async getAdminStats() {
    const [totalChallenges, publishedChallenges, totalEnrollments, completedEnrollments] =
      await Promise.all([
        prisma.challenge.count(),
        prisma.challenge.count({ where: { isPublished: true } }),
        prisma.challengeEnrollment.count(),
        prisma.challengeEnrollment.count({ where: { status: 'COMPLETED' } }),
      ]);

    return {
      totalChallenges,
      publishedChallenges,
      totalEnrollments,
      completedEnrollments,
    };
  }
}

export const challengesRepository = new ChallengesRepository();
