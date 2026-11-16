import { prisma } from '../../config/prisma';
import { Prisma, Platform } from '@prisma/client';
import { GuideQueryParams, CreateGuideDTO, UpdateGuideDTO } from './guides.types';

export class GuidesRepository {
  async findMany(params: GuideQueryParams, onlyPublished = true) {
    const { page = 1, limit = 12, platform, difficulty, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.DeviceGuideWhereInput = {};

    if (onlyPublished) {
      where.isPublished = true;
    }

    if (platform) {
      where.platform = platform;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [guides, total] = await Promise.all([
      prisma.deviceGuide.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.deviceGuide.count({ where }),
    ]);

    return { guides, total };
  }

  async findBySlug(slug: string, onlyPublished = false) {
    const where: Prisma.DeviceGuideWhereInput = { slug };
    if (onlyPublished) {
      where.isPublished = true;
    }

    return prisma.deviceGuide.findFirst({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.deviceGuide.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findRelated(platform: Platform, excludeSlug: string, limit = 3) {
    return prisma.deviceGuide.findMany({
      where: {
        platform,
        isPublished: true,
        slug: { not: excludeSlug },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        platform: true,
        difficulty: true,
        estimatedMinutes: true,
      },
    });
  }

  async create(data: CreateGuideDTO & { slug: string; authorId: string }) {
    return prisma.deviceGuide.create({
      data: {
        title: data.title,
        slug: data.slug,
        platform: data.platform,
        difficulty: data.difficulty,
        estimatedMinutes: data.estimatedMinutes,
        steps: data.steps as unknown as Prisma.InputJsonValue,
        authorId: data.authorId,
        isPublished: data.isPublished ?? false,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateGuideDTO) {
    const updateData: Prisma.DeviceGuideUpdateInput = {
      ...(data.title ? { title: data.title } : {}),
      ...(data.slug ? { slug: data.slug } : {}),
      ...(data.platform ? { platform: data.platform } : {}),
      ...(data.difficulty ? { difficulty: data.difficulty } : {}),
      ...(data.estimatedMinutes ? { estimatedMinutes: data.estimatedMinutes } : {}),
      ...(data.steps ? { steps: data.steps as unknown as Prisma.InputJsonValue } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
    };

    return prisma.deviceGuide.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.deviceGuide.delete({
      where: { id },
    });
  }
}

export const guidesRepository = new GuidesRepository();
