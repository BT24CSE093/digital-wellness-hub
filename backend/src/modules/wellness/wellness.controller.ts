import { Request, Response } from 'express';
import { wellnessService } from './wellness.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import {
  createFocusSessionSchema,
  focusSessionQuerySchema,
  createScreenTimeLogSchema,
  updateScreenTimeLogSchema,
  screenTimeQuerySchema,
  upsertScreenTimeGoalSchema,
  submitAssessmentSchema,
  upsertDailyPlannerSchema,
  updateDailyPlannerSchema,
} from './wellness.validation';

export class WellnessController {
  // ==========================================
  // FOCUS SESSIONS
  // ==========================================
  async createFocusSession(req: Request, res: Response): Promise<void> {
    const parsed = createFocusSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid focus session payload.',
        details: parsed.error.flatten(),
      });
      return;
    }

    const session = await wellnessService.createFocusSession(req.user!.sub, parsed.data);
    sendSuccess({ res, statusCode: 201, data: session });
  }

  async listFocusSessions(req: Request, res: Response): Promise<void> {
    const parsed = focusSessionQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters.',
        details: parsed.error.flatten(),
      });
      return;
    }

    const result = await wellnessService.listFocusSessions(req.user!.sub, parsed.data);
    sendSuccess({ res, data: result.sessions, meta: result.meta });
  }

  async getFocusSessionById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const session = await wellnessService.getFocusSessionById(id, req.user!.sub);
    if (!session) {
      sendError({
        res,
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Focus session not found or does not belong to you.',
      });
      return;
    }
    sendSuccess({ res, data: session });
  }

  async deleteFocusSession(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const session = await wellnessService.deleteFocusSession(id, req.user!.sub);
    if (!session) {
      sendError({
        res,
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Focus session not found or does not belong to you.',
      });
      return;
    }
    sendSuccess({ res, data: { message: 'Focus session removed.' } });
  }

  async getFocusSummary(req: Request, res: Response): Promise<void> {
    const summary = await wellnessService.getFocusSummary(req.user!.sub);
    sendSuccess({ res, data: summary });
  }

  // ==========================================
  // SCREEN TIME LOGS & GOALS
  // ==========================================
  async createScreenTimeLog(req: Request, res: Response): Promise<void> {
    const parsed = createScreenTimeLogSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid screen-time log payload.',
        details: parsed.error.flatten(),
      });
      return;
    }

    const log = await wellnessService.upsertScreenTimeLog(req.user!.sub, parsed.data);
    sendSuccess({ res, statusCode: 200, data: log });
  }

  async listScreenTimeLogs(req: Request, res: Response): Promise<void> {
    const parsed = screenTimeQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters.',
        details: parsed.error.flatten(),
      });
      return;
    }

    const logs = await wellnessService.listScreenTimeLogs(req.user!.sub, parsed.data);
    sendSuccess({ res, data: logs });
  }

  async getScreenTimeLogById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const log = await wellnessService.getScreenTimeLogById(id, req.user!.sub);
    if (!log) {
      sendError({
        res,
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Screen-time log not found or does not belong to you.',
      });
      return;
    }
    sendSuccess({ res, data: log });
  }

  async updateScreenTimeLog(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = updateScreenTimeLogSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid screen-time update payload.',
        details: parsed.error.flatten(),
      });
      return;
    }

    const updated = await wellnessService.updateScreenTimeLog(id, req.user!.sub, parsed.data);
    if (!updated) {
      sendError({
        res,
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Screen-time log not found or does not belong to you.',
      });
      return;
    }
    sendSuccess({ res, data: updated });
  }

  async deleteScreenTimeLog(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const deleted = await wellnessService.deleteScreenTimeLog(id, req.user!.sub);
    if (!deleted) {
      sendError({
        res,
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Screen-time log not found or does not belong to you.',
      });
      return;
    }
    sendSuccess({ res, data: { message: 'Screen-time log deleted.' } });
  }

  async getScreenTimeSummary(req: Request, res: Response): Promise<void> {
    const summary = await wellnessService.getScreenTimeSummary(req.user!.sub);
    sendSuccess({ res, data: summary });
  }

  async upsertScreenTimeGoal(req: Request, res: Response): Promise<void> {
    const parsed = upsertScreenTimeGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid screen-time goal payload.',
        details: parsed.error.flatten(),
      });
      return;
    }

    const goal = await wellnessService.upsertScreenTimeGoal(req.user!.sub, parsed.data);
    sendSuccess({ res, data: goal });
  }

  async getScreenTimeGoal(req: Request, res: Response): Promise<void> {
    const goal = await wellnessService.getScreenTimeGoal(req.user!.sub);
    sendSuccess({ res, data: goal });
  }

  // ==========================================
  // WELLNESS ASSESSMENTS
  // ==========================================
  async submitAssessment(req: Request, res: Response): Promise<void> {
    const parsed = submitAssessmentSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid assessment responses.',
        details: parsed.error.flatten(),
      });
      return;
    }

    const assessment = await wellnessService.submitAssessment(req.user!.sub, parsed.data);
    sendSuccess({ res, statusCode: 201, data: assessment });
  }

  async listAssessments(req: Request, res: Response): Promise<void> {
    const assessments = await wellnessService.listAssessments(req.user!.sub);
    sendSuccess({ res, data: assessments });
  }

  async getLatestAssessment(req: Request, res: Response): Promise<void> {
    const assessment = await wellnessService.getLatestAssessment(req.user!.sub);
    sendSuccess({ res, data: assessment });
  }

  async getAssessmentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const assessment = await wellnessService.getAssessmentById(id, req.user!.sub);
    if (!assessment) {
      sendError({
        res,
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Assessment not found or does not belong to you.',
      });
      return;
    }
    sendSuccess({ res, data: assessment });
  }

  // ==========================================
  // DAILY PLANNER
  // ==========================================
  async upsertDailyPlanner(req: Request, res: Response): Promise<void> {
    const parsed = upsertDailyPlannerSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid daily planner payload.',
        details: parsed.error.flatten(),
      });
      return;
    }

    const plan = await wellnessService.upsertDailyPlanner(req.user!.sub, parsed.data);
    sendSuccess({ res, statusCode: 200, data: plan });
  }

  async getDailyPlanner(req: Request, res: Response): Promise<void> {
    const dateStr = typeof req.query.date === 'string' ? req.query.date : undefined;
    const plan = await wellnessService.getDailyPlannerByDate(req.user!.sub, dateStr);
    sendSuccess({ res, data: plan });
  }

  async updateDailyPlanner(req: Request, res: Response): Promise<void> {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      sendError({
        res,
        statusCode: 400,
        code: 'INVALID_DATE',
        message: 'Date parameter must be YYYY-MM-DD.',
      });
      return;
    }

    const parsed = updateDailyPlannerSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid planner update payload.',
        details: parsed.error.flatten(),
      });
      return;
    }

    const updated = await wellnessService.updateDailyPlanner(req.user!.sub, date, parsed.data);
    if (!updated) {
      sendError({
        res,
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Planner not found for specified date.',
      });
      return;
    }
    sendSuccess({ res, data: updated });
  }

  async getRecentDailyPlanners(req: Request, res: Response): Promise<void> {
    const recent = await wellnessService.getRecentDailyPlanners(req.user!.sub);
    sendSuccess({ res, data: recent });
  }

  // ==========================================
  // DASHBOARD SUMMARY
  // ==========================================
  async getDashboardSummary(req: Request, res: Response): Promise<void> {
    const summary = await wellnessService.getDashboardSummary(req.user!.sub);
    sendSuccess({ res, data: summary });
  }
}

export const wellnessController = new WellnessController();
