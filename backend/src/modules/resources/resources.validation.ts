import { z } from 'zod';
import { PricingModel } from '@prisma/client';

export const resourceQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    category: z.string().optional(),
    pricingModel: z.nativeEnum(PricingModel).optional(),
    platform: z.string().optional(),
    isVerified: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
    search: z.string().trim().optional(),
    sortBy: z.enum(['ratingAvg', 'createdAt', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const resourceIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Resource identifier is required'),
  }),
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category identifier is required'),
  }),
});

export const createResourceSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(100),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
      .optional(),
    tagline: z.string().min(5, 'Tagline must be at least 5 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    websiteUrl: z.string().url('websiteUrl must be a valid URL'),
    pricingModel: z.nativeEnum(PricingModel, {
      errorMap: () => ({ message: 'pricingModel must be FREE, FREEMIUM, PAID, or OPEN_SOURCE' }),
    }),
    platforms: z.array(z.string().min(1)).min(1, 'At least one platform is required'),
    categoryId: z.string().min(1, 'categoryId is required'),
    isVerified: z.boolean().optional().default(false),
  }),
});

export const updateResourceSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Resource identifier is required'),
  }),
  body: z.object({
    title: z.string().min(2).max(100).optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
      .optional(),
    tagline: z.string().min(5).max(200).optional(),
    description: z.string().min(10).optional(),
    websiteUrl: z.string().url().optional(),
    pricingModel: z.nativeEnum(PricingModel).optional(),
    platforms: z.array(z.string().min(1)).min(1).optional(),
    categoryId: z.string().min(1).optional(),
    isVerified: z.boolean().optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
      .optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category identifier is required'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
      .optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});
