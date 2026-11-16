import { z } from 'zod';

export const PricingModelEnum = z.enum(['FREE', 'FREEMIUM', 'PAID', 'OPEN_SOURCE']);
export const FeedbackTypeEnum = z.enum([
  'BUG_REPORT',
  'UI_UX_SUGGESTION',
  'CONTENT_CORRECTION',
  'ACCESSIBILITY_ISSUE',
  'GENERAL_FEEDBACK',
]);
export const SubmissionStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED']);
export const ReportContentTypeEnum = z.enum(['RESOURCE', 'GUIDE']);

export const suggestResourceSchema = z.object({
  title: z.string().min(2).max(100),
  tagline: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  websiteUrl: z.string().url(),
  pricingModel: PricingModelEnum,
  platforms: z.array(z.string()).min(1),
  categoryId: z.string().min(1),
});

export const feedbackSchema = z.object({
  type: FeedbackTypeEnum,
  title: z.string().min(3).max(120),
  details: z.string().min(10).max(3000),
  pageUrl: z.string().url().optional().or(z.literal('')),
});

export const reportSchema = z.object({
  contentType: ReportContentTypeEnum,
  contentId: z.string().min(1),
  reason: z.string().min(5).max(200),
  details: z.string().max(2000).optional(),
});

export const moderateSubmissionSchema = z.object({
  status: SubmissionStatusEnum,
  adminNotes: z.string().max(1000).optional(),
});
