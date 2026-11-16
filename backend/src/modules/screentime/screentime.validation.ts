import { z } from 'zod';

export const upsertScreenTimeLogSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'logDate must be YYYY-MM-DD'),
  totalMinutes: z.number().int().min(0).max(1440),
  productiveMinutes: z.number().int().min(0).max(1440).optional(),
  distractingMinutes: z.number().int().min(0).max(1440).optional(),
  pickupsCount: z.number().int().min(0).optional(),
  categoryBreakdown: z.record(z.number()).optional(),
  notes: z.string().max(500).optional(),
});

export const upsertScreenTimeGoalSchema = z.object({
  maxDailyMinutes: z.number().int().min(30).max(1440).optional(),
  maxDistractingMinutes: z.number().int().min(0).max(1440).optional(),
  targetBedtimeHour: z.number().int().min(18).max(30).optional(), // 18-30 allows up to 6am next day
});

export const screenTimeQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(90).optional(),
});
