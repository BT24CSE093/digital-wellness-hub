import { Request, Response } from 'express';
import { communityService } from './community.service';
import {
  suggestResourceSchema,
  feedbackSchema,
  reportSchema,
  moderateSubmissionSchema,
} from './community.validation';
import { AppError } from '../../middleware/errorHandler';
import { ZodError } from 'zod';
import { SubmissionStatus, FeedbackType } from '@prisma/client';

const handleError = (res: Response, err: unknown) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input parameters',
        details: err.flatten().fieldErrors,
      },
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code || 'BAD_REQUEST', message: err.message },
    });
  }
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message },
  });
};

export class CommunityController {
  // Student - Resource Suggestion
  async suggestResource(req: Request, res: Response) {
    try {
      const parsed = suggestResourceSchema.parse(req.body);
      const result = await communityService.suggestResource(req.user!.sub, parsed);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  // Student - Feedback
  async submitFeedback(req: Request, res: Response) {
    try {
      const parsed = feedbackSchema.parse(req.body);
      const result = await communityService.submitFeedback(req.user!.sub, {
        ...parsed,
        pageUrl: parsed.pageUrl || undefined,
      });
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  // Student - Content Report
  async submitReport(req: Request, res: Response) {
    try {
      const parsed = reportSchema.parse(req.body);
      const result = await communityService.submitReport(req.user!.sub, parsed);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  // Student - Get My Submissions
  async getMySubmissions(req: Request, res: Response) {
    try {
      const result = await communityService.getMySubmissionsSummary(req.user!.sub);
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  // Admin - List Suggestions
  async listAdminSuggestions(req: Request, res: Response) {
    try {
      const status = req.query.status as SubmissionStatus | undefined;
      const result = await communityService.listAllSuggestions(status);
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  // Admin - Moderate Suggestion
  async moderateSuggestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = moderateSubmissionSchema.parse(req.body);
      const result = await communityService.moderateSuggestion(
        id,
        parsed.status,
        parsed.adminNotes,
        req.user!.sub
      );
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  // Admin - List Feedback
  async listAdminFeedback(req: Request, res: Response) {
    try {
      const status = req.query.status as SubmissionStatus | undefined;
      const type = req.query.type as FeedbackType | undefined;
      const result = await communityService.listAllFeedback(status, type);
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  // Admin - Moderate Feedback
  async moderateFeedback(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = moderateSubmissionSchema.parse(req.body);
      const result = await communityService.moderateFeedback(id, parsed.status, parsed.adminNotes);
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  // Admin - List Reports
  async listAdminReports(req: Request, res: Response) {
    try {
      const status = req.query.status as SubmissionStatus | undefined;
      const result = await communityService.listAllReports(status);
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  // Admin - Moderate Report
  async moderateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = moderateSubmissionSchema.parse(req.body);
      const result = await communityService.moderateReport(id, parsed.status, parsed.adminNotes);
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }
}

export const communityController = new CommunityController();
