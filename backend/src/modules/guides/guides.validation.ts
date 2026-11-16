import { z } from 'zod';
import { Platform, Difficulty } from '@prisma/client';

export const guideQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    platform: z.nativeEnum(Platform).optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    search: z.string().trim().optional(),
  }),
});

export const guideSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Guide slug is required'),
  }),
});

export const guideIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Guide ID is required'),
  }),
});

export const guideStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  title: z.string().min(2, 'Step title must be at least 2 characters'),
  instruction: z.string().min(5, 'Step instruction must be at least 5 characters'),
  tip: z.string().optional(),
  warning: z.string().optional(),
});

export const createGuideSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(150),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
      .optional(),
    platform: z.nativeEnum(Platform, {
      errorMap: () => ({ message: 'platform must be IOS, ANDROID, MACOS, WINDOWS, LINUX, or BROWSER' }),
    }),
    difficulty: z.nativeEnum(Difficulty, {
      errorMap: () => ({ message: 'difficulty must be BEGINNER, INTERMEDIATE, or ADVANCED' }),
    }),
    estimatedMinutes: z.number().int().min(1, 'Estimated minutes must be at least 1').max(180),
    steps: z.array(guideStepSchema).min(1, 'At least one guide step is required'),
    isPublished: z.boolean().optional().default(false),
  }),
});

export const updateGuideSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Guide ID is required'),
  }),
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
      .optional(),
    platform: z.nativeEnum(Platform).optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    estimatedMinutes: z.number().int().min(1).max(180).optional(),
    steps: z.array(guideStepSchema).min(1).optional(),
    isPublished: z.boolean().optional(),
  }),
});
