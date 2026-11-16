import { Request, Response } from 'express';
import { focusService } from './focus.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { createFocusSessionSchema, focusQuerySchema } from './focus.validation';

export class FocusController {
  async logSession(req: Request, res: Response): Promise<void> {
    const parsed = createFocusSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({ res, statusCode: 422, code: 'VALIDATION_ERROR', message: 'Invalid input.', details: parsed.error.flatten() });
      return;
    }
    const session = await focusService.logSession(req.user!.sub, parsed.data);
    sendSuccess({ res, statusCode: 201, data: session });
  }

  async listSessions(req: Request, res: Response): Promise<void> {
    const parsed = focusQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendError({ res, statusCode: 422, code: 'VALIDATION_ERROR', message: 'Invalid query.', details: parsed.error.flatten() });
      return;
    }
    const result = await focusService.listSessions(req.user!.sub, parsed.data);
    sendSuccess({ res, data: result.sessions, meta: result.meta });
  }

  async getStats(req: Request, res: Response): Promise<void> {
    const stats = await focusService.getStats(req.user!.sub);
    sendSuccess({ res, data: stats });
  }

  async getWeeklyTrend(req: Request, res: Response): Promise<void> {
    const trend = await focusService.getWeeklyTrend(req.user!.sub);
    sendSuccess({ res, data: trend });
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const session = await focusService.deleteSession(req.user!.sub, id);
    if (!session) {
      sendError({ res, statusCode: 404, code: 'NOT_FOUND', message: 'Focus session not found.' });
      return;
    }
    sendSuccess({ res, data: { message: 'Session deleted.' } });
  }
}

export const focusController = new FocusController();
