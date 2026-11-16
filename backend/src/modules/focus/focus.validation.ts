import { z } from 'zod';
import { SessionType } from '@prisma/client';

export const createFocusSessionSchema = z.object({
  sessionType: z.nativeEnum(SessionType).optional(),
  durationMinutes: z.number().int().min(1).max(480),
  intention: z.string().max(500).optional(),
  reflection: z.string().max(1000).optional(),
  distractionsCount: z.number().int().min(0).optional(),
  focusRating: z.number().int().min(1).max(5).optional(),
});

export const focusQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sessionType: z.nativeEnum(SessionType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
