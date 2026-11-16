import { z } from 'zod';
import { SessionType } from '@prisma/client';

export const wellnessDimensions = [
  'screenTimeAwareness',
  'focusBehavior',
  'deviceHabits',
  'sleepAndRestoration',
  'socialDigitalBalance',
] as const;

export const assessmentResponseSchema = z.object({
  questionId: z.string().min(1),
  dimensionId: z.enum(wellnessDimensions),
  score: z.number().int().min(1).max(5),
});

export const submitAssessmentSchema = z.object({
  responses: z.array(assessmentResponseSchema).min(5).max(25),
});

// Focus validation
export const createFocusSessionSchema = z.object({
  sessionType: z.nativeEnum(SessionType).optional(),
  durationMinutes: z.number().int().min(1, 'Duration must be at least 1 minute').max(480, 'Duration cannot exceed 480 minutes (8 hours)'),
  intention: z.string().max(500, 'Intention must be at most 500 characters').optional().nullable(),
  reflection: z.string().max(1000, 'Reflection must be at most 1000 characters').optional().nullable(),
  distractionsCount: z.number().int().min(0, 'Distractions count cannot be negative').optional(),
  focusRating: z.number().int().min(1).max(5).optional().nullable(),
});

export const focusSessionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sessionType: z.nativeEnum(SessionType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Screen Time validation
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createScreenTimeLogSchema = z.object({
  logDate: z.string().regex(dateRegex, 'logDate must be formatted as YYYY-MM-DD').optional(),
  totalMinutes: z.number().int().min(0, 'Total minutes cannot be negative').max(1440, 'Total minutes cannot exceed 1440 (24 hours)'),
  productiveMinutes: z.number().int().min(0, 'Productive minutes cannot be negative').max(1440).optional(),
  distractingMinutes: z.number().int().min(0, 'Distracting minutes cannot be negative').max(1440).optional(),
  pickupsCount: z.number().int().min(0, 'Pickups count cannot be negative').optional(),
  categoryBreakdown: z.record(z.number().min(0).max(1440)).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateScreenTimeLogSchema = z.object({
  totalMinutes: z.number().int().min(0).max(1440).optional(),
  productiveMinutes: z.number().int().min(0).max(1440).optional(),
  distractingMinutes: z.number().int().min(0).max(1440).optional(),
  pickupsCount: z.number().int().min(0).optional(),
  categoryBreakdown: z.record(z.number().min(0).max(1440)).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const screenTimeQuerySchema = z.object({
  startDate: z.string().regex(dateRegex, 'startDate must be YYYY-MM-DD').optional(),
  endDate: z.string().regex(dateRegex, 'endDate must be YYYY-MM-DD').optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const upsertScreenTimeGoalSchema = z.object({
  maxDailyMinutes: z.number().int().min(30, 'Goal must be at least 30 minutes').max(1440, 'Goal cannot exceed 1440 minutes').optional(),
  maxDistractingMinutes: z.number().int().min(0).max(1440).optional(),
  targetBedtimeHour: z.number().int().min(0).max(23, 'Bedtime hour must be between 0 and 23').optional(),
  isActive: z.boolean().optional(),
});

// Daily Planner validation
export const plannerTaskSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, 'Task text cannot be empty').max(300),
  description: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  completed: z.boolean(),
  timeEstimateMinutes: z.number().int().min(1).max(480).optional(),
});

export const upsertDailyPlannerSchema = z.object({
  planDate: z.string().regex(dateRegex, 'planDate must be formatted as YYYY-MM-DD').optional(),
  digitalIntention: z.string().min(1, 'Digital intention is required').max(500),
  priorityTasks: z.array(plannerTaskSchema).max(20).optional(),
});

export const updateDailyPlannerSchema = z.object({
  digitalIntention: z.string().min(1).max(500).optional(),
  priorityTasks: z.array(plannerTaskSchema).max(20).optional(),
  shutdownCompleted: z.boolean().optional(),
});
