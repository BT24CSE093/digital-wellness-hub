import { Request, Response } from 'express';
import { screenTimeService } from './screentime.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { upsertScreenTimeLogSchema, upsertScreenTimeGoalSchema, screenTimeQuerySchema } from './screentime.validation';

export class ScreenTimeController {
  async upsertLog(req: Request, res: Response): Promise<void> {
    const parsed = upsertScreenTimeLogSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({ res, statusCode: 422, code: 'VALIDATION_ERROR', message: 'Invalid input.', details: parsed.error.flatten() });
      return;
    }
    const log = await screenTimeService.upsertLog(req.user!.sub, parsed.data);
    sendSuccess({ res, statusCode: 200, data: log });
  }

  async getLogs(req: Request, res: Response): Promise<void> {
    const parsed = screenTimeQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendError({ res, statusCode: 422, code: 'VALIDATION_ERROR', message: 'Invalid query.', details: parsed.error.flatten() });
      return;
    }
    const logs = await screenTimeService.getLogs(req.user!.sub, parsed.data);
    sendSuccess({ res, data: logs });
  }

  async getTodayLog(req: Request, res: Response): Promise<void> {
    const log = await screenTimeService.getTodayLog(req.user!.sub);
    sendSuccess({ res, data: log });
  }

  async upsertGoal(req: Request, res: Response): Promise<void> {
    const parsed = upsertScreenTimeGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({ res, statusCode: 422, code: 'VALIDATION_ERROR', message: 'Invalid input.', details: parsed.error.flatten() });
      return;
    }
    const goal = await screenTimeService.upsertGoal(req.user!.sub, parsed.data);
    sendSuccess({ res, data: goal });
  }

  async getGoal(req: Request, res: Response): Promise<void> {
    const goal = await screenTimeService.getGoal(req.user!.sub);
    sendSuccess({ res, data: goal });
  }

  async getWeeklyStats(req: Request, res: Response): Promise<void> {
    const stats = await screenTimeService.getWeeklyStats(req.user!.sub);
    sendSuccess({ res, data: stats });
  }
}

export const screenTimeController = new ScreenTimeController();
