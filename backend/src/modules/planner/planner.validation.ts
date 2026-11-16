import { z } from 'zod';

export const priorityTaskSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(200),
  completed: z.boolean(),
});

export const upsertPlannerSchema = z.object({
  planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'planDate must be YYYY-MM-DD'),
  digitalIntention: z.string().min(1).max(500),
  priorityTasks: z.array(priorityTaskSchema).max(5).optional(),
});

export const updatePlannerSchema = z.object({
  digitalIntention: z.string().min(1).max(500).optional(),
  priorityTasks: z.array(priorityTaskSchema).max(5).optional(),
  shutdownCompleted: z.boolean().optional(),
});
