import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';
import {
  ResourceQueryParams,
  CreateResourceDTO,
  UpdateResourceDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from './resources.types';

export class ResourcesRepository {
  async findMany(params: ResourceQueryParams) {
    const {
      page = 1,
      limit = 12,
      category,
      pricingModel,
      platform,
      isVerified,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.ResourceWhereInput = {};

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    if (pricingModel) {
      where.pricingModel = pricingModel;
    }

    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    if (platform) {
      const upperPlatform = platform.toUpperCase();
      where.platforms = {
        has: upperPlatform,
      };
    }

    if (search) {
      const searchCondition: Prisma.ResourceWhereInput[] = [
        { title: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchCondition },
        ];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
    }

    const orderBy: Prisma.ResourceOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.resource.count({ where }),
    ]);

    return { resources, total };
  }

  async findByIdOrSlug(idOrSlug: string) {
    return prisma.resource.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.resource.findUnique({
      where: { slug },
    });
  }

  async create(data: CreateResourceDTO & { slug: string; submittedByUserId?: string; verifiedByUserId?: string; verifiedAt?: Date }) {
    return prisma.resource.create({
      data: {
        title: data.title,
        slug: data.slug,
        tagline: data.tagline,
        description: data.description,
        websiteUrl: data.websiteUrl,
        pricingModel: data.pricingModel,
        platforms: data.platforms,
        categoryId: data.categoryId,
        isVerified: data.isVerified ?? false,
        submittedByUserId: data.submittedByUserId,
        verifiedByUserId: data.verifiedByUserId,
        verifiedAt: data.verifiedAt,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: UpdateResourceDTO & { verifiedByUserId?: string | null; verifiedAt?: Date | null }) {
    return prisma.resource.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.resource.delete({
      where: { id },
    });
  }

  // Category methods
  async findCategories() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { resources: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findCategoryByIdOrSlug(idOrSlug: string) {
    return prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        _count: {
          select: { resources: true },
        },
      },
    });
  }

  async createCategory(data: CreateCategoryDTO & { slug: string }) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
      },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryDTO) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const resourcesRepository = new ResourcesRepository();
