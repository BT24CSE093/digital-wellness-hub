import { Request, Response } from 'express';
import { plannerService } from './planner.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { upsertPlannerSchema, updatePlannerSchema } from './planner.validation';

export class PlannerController {
  async upsertPlan(req: Request, res: Response): Promise<void> {
    const parsed = upsertPlannerSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({ res, statusCode: 422, code: 'VALIDATION_ERROR', message: 'Invalid planner data.', details: parsed.error.flatten() });
      return;
    }
    const plan = await plannerService.upsertPlan(req.user!.sub, parsed.data);
    sendSuccess({ res, statusCode: 200, data: plan });
  }

  async getPlanByDate(req: Request, res: Response): Promise<void> {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      sendError({ res, statusCode: 400, code: 'INVALID_DATE', message: 'Date must be YYYY-MM-DD.' });
      return;
    }
    const plan = await plannerService.getPlanByDate(req.user!.sub, date);
    sendSuccess({ res, data: plan });
  }

  async getRecentPlans(req: Request, res: Response): Promise<void> {
    const plans = await plannerService.getRecentPlans(req.user!.sub);
    sendSuccess({ res, data: plans });
  }

  async updatePlan(req: Request, res: Response): Promise<void> {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      sendError({ res, statusCode: 400, code: 'INVALID_DATE', message: 'Date must be YYYY-MM-DD.' });
      return;
    }
    const parsed = updatePlannerSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({ res, statusCode: 422, code: 'VALIDATION_ERROR', message: 'Invalid update data.', details: parsed.error.flatten() });
      return;
    }
    const plan = await plannerService.updatePlan(req.user!.sub, date, parsed.data);
    if (!plan) {
      sendError({ res, statusCode: 404, code: 'NOT_FOUND', message: 'Plan not found for this date.' });
      return;
    }
    sendSuccess({ res, data: plan });
  }
}

export const plannerController = new PlannerController();
