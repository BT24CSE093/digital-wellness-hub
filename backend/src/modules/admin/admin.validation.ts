import { z } from 'zod';

export const verifyResourceSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Resource ID is required'),
  }),
  body: z.object({
    isVerified: z.boolean({ required_error: 'isVerified boolean is required' }),
  }),
});

export const publishGuideSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Guide ID is required'),
  }),
  body: z.object({
    isPublished: z.boolean({ required_error: 'isPublished boolean is required' }),
  }),
});
