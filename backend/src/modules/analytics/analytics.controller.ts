import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/apiResponse';

export class AnalyticsController {
  async getDashboardSummary(req: Request, res: Response): Promise<void> {
    const summary = await analyticsService.getDashboardSummary(req.user!.sub);
    sendSuccess({ res, data: summary });
  }

  async getWeeklyFocusTrend(req: Request, res: Response): Promise<void> {
    const trend = await analyticsService.getWeeklyFocusTrend(req.user!.sub);
    sendSuccess({ res, data: trend });
  }

  async getWeeklyScreenTimeTrend(req: Request, res: Response): Promise<void> {
    const trend = await analyticsService.getWeeklyScreenTimeTrend(req.user!.sub);
    sendSuccess({ res, data: trend });
  }
}

export const analyticsController = new AnalyticsController();
