import { Request, Response } from 'express';
import { challengesService } from './challenges.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AppError } from '../../middleware/errorHandler';
import {
  challengeQuerySchema,
  challengeIdParamSchema,
  enrollmentIdParamSchema,
  createChallengeSchema,
  updateChallengeSchema,
  updateProgressSchema,
} from './challenges.validation';

function handleError(res: Response, err: unknown) {
  if (err instanceof AppError) {
    sendError({
      res,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
    });
    return;
  }
  const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
  sendError({
    res,
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message,
  });
}

export class ChallengesController {
  // ==========================================
  // PUBLIC CHALLENGES
  // ==========================================
  async listChallenges(req: Request, res: Response): Promise<void> {
    const parsed = challengeQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid challenge filter parameters.',
        details: parsed.error.flatten(),
      });
      return;
    }

    try {
      const currentUserId = req.user?.sub;
      const result = await challengesService.listChallenges(parsed.data, currentUserId);
      sendSuccess({ res, data: result.challenges, meta: result.meta });
    } catch (err) {
      handleError(res, err);
    }
  }

  async getChallenge(req: Request, res: Response): Promise<void> {
    const parsed = challengeIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Challenge ID or slug is required.',
      });
      return;
    }

    try {
      const currentUserId = req.user?.sub;
      const challenge = await challengesService.getChallengeDetail(parsed.data.id, currentUserId);
      if (!challenge) {
        sendError({
          res,
          statusCode: 404,
          code: 'NOT_FOUND',
          message: 'Challenge not found.',
        });
        return;
      }

      sendSuccess({ res, data: challenge });
    } catch (err) {
      handleError(res, err);
    }
  }

  // ==========================================
  // STUDENT ENROLLMENT & PROGRESS
  // ==========================================
  async enroll(req: Request, res: Response): Promise<void> {
    const parsed = challengeIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Challenge ID or slug is required.',
      });
      return;
    }

    try {
      const enrollment = await challengesService.enroll(req.user!.sub, parsed.data.id);
      sendSuccess({ res, statusCode: 201, data: enrollment });
    } catch (err) {
      handleError(res, err);
    }
  }

  async cancelEnrollment(req: Request, res: Response): Promise<void> {
    const parsed = challengeIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Challenge ID or slug is required.',
      });
      return;
    }

    try {
      await challengesService.cancelEnrollment(req.user!.sub, parsed.data.id);
      sendSuccess({ res, data: { message: 'Enrollment successfully cancelled.' } });
    } catch (err) {
      handleError(res, err);
    }
  }

  async listMyEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const list = await challengesService.listMyEnrollments(req.user!.sub);
      sendSuccess({ res, data: list });
    } catch (err) {
      handleError(res, err);
    }
  }

  async getMyEnrollmentDetail(req: Request, res: Response): Promise<void> {
    const parsed = enrollmentIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Enrollment ID is required.',
      });
      return;
    }

    try {
      const detail = await challengesService.getMyEnrollmentDetail(parsed.data.enrollmentId, req.user!.sub);
      sendSuccess({ res, data: detail });
    } catch (err) {
      handleError(res, err);
    }
  }

  async updateProgress(req: Request, res: Response): Promise<void> {
    const paramParsed = enrollmentIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Enrollment ID is required.',
      });
      return;
    }

    const bodyParsed = updateProgressSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid progress data.',
        details: bodyParsed.error.flatten(),
      });
      return;
    }

    try {
      const updated = await challengesService.updateProgress(
        paramParsed.data.enrollmentId,
        req.user!.sub,
        bodyParsed.data
      );
      sendSuccess({ res, data: updated });
    } catch (err) {
      handleError(res, err);
    }
  }

  // ==========================================
  // GAMIFICATION & ACHIEVEMENTS
  // ==========================================
  async getAchievements(req: Request, res: Response): Promise<void> {
    try {
      const achievements = await challengesService.getAchievements(req.user!.sub);
      sendSuccess({ res, data: achievements });
    } catch (err) {
      handleError(res, err);
    }
  }

  async getGamificationDashboard(req: Request, res: Response): Promise<void> {
    try {
      const dashboard = await challengesService.getGamificationDashboard(req.user!.sub);
      sendSuccess({ res, data: dashboard });
    } catch (err) {
      handleError(res, err);
    }
  }

  // ==========================================
  // ADMIN MANAGEMENT
  // ==========================================
  async createChallenge(req: Request, res: Response): Promise<void> {
    const parsed = createChallengeSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid challenge data.',
        details: parsed.error.flatten(),
      });
      return;
    }

    try {
      const created = await challengesService.createChallenge(parsed.data);
      sendSuccess({ res, statusCode: 201, data: created });
    } catch (err) {
      handleError(res, err);
    }
  }

  async updateChallenge(req: Request, res: Response): Promise<void> {
    const paramParsed = challengeIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Challenge ID is required.',
      });
      return;
    }

    const bodyParsed = updateChallengeSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid update payload.',
        details: bodyParsed.error.flatten(),
      });
      return;
    }

    try {
      const updated = await challengesService.updateChallenge(paramParsed.data.id, bodyParsed.data);
      sendSuccess({ res, data: updated });
    } catch (err) {
      handleError(res, err);
    }
  }

  async togglePublish(req: Request, res: Response): Promise<void> {
    const paramParsed = challengeIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Challenge ID is required.',
      });
      return;
    }

    try {
      const updated = await challengesService.togglePublish(paramParsed.data.id);
      sendSuccess({ res, data: updated });
    } catch (err) {
      handleError(res, err);
    }
  }

  async deleteChallenge(req: Request, res: Response): Promise<void> {
    const paramParsed = challengeIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      sendError({
        res,
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Challenge ID is required.',
      });
      return;
    }

    try {
      await challengesService.deleteChallenge(paramParsed.data.id);
      sendSuccess({ res, data: { message: 'Challenge removed.' } });
    } catch (err) {
      handleError(res, err);
    }
  }

  async getAdminStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await challengesService.getAdminStats();
      sendSuccess({ res, data: stats });
    } catch (err) {
      handleError(res, err);
    }
  }
}

export const challengesController = new ChallengesController();
