import { z } from 'zod';
import { Difficulty } from '@prisma/client';

export const challengeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  minDuration: z.coerce.number().int().min(1).optional(),
  maxDuration: z.coerce.number().int().max(365).optional(),
  search: z.string().optional(),
  isPublished: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
});

export const challengeIdParamSchema = z.object({
  id: z.string().min(1, 'Challenge ID or slug is required.'),
});

export const enrollmentIdParamSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required.'),
});

export const challengeActivitySchema = z.object({
  day: z.number().int().min(1),
  title: z.string().min(1).max(200),
  instructions: z.string().min(1).max(1000),
});

export const createChallengeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  durationDays: z.number().int().min(1, 'Duration must be at least 1 day.').max(90, 'Duration cannot exceed 90 days.'),
  difficulty: z.nativeEnum(Difficulty).optional(),
  badgeIcon: z.string().min(1).max(50).optional(),
  isPublished: z.boolean().optional(),
  activities: z.array(challengeActivitySchema).optional(),
});

export const updateChallengeSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  durationDays: z.number().int().min(1).max(90).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  badgeIcon: z.string().min(1).max(50).optional(),
  isPublished: z.boolean().optional(),
  activities: z.array(challengeActivitySchema).optional(),
});

export const updateProgressSchema = z.object({
  dayNumber: z.number().int().min(1, 'Day number must be at least 1.'),
  completed: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});
