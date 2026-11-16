import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { UserRole } from '@prisma/client';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/prisma';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authenticateToken } from './middleware/auth.middleware';
import { requireRole } from './middleware/role.middleware';
import { authRoutes } from './modules/auth';
import { resourceRoutes, categoryRoutes } from './modules/resources';
import { guideRoutes } from './modules/guides';
import { adminRoutes } from './modules/admin';
import { wellnessRoutes } from './modules/wellness';
import { challengeRoutes } from './modules/challenges';
import communityRoutes from './modules/community/community.routes';
import { sendSuccess, sendError } from './utils/apiResponse';

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing and cookie middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  /**
   * GET /api/v1/health
   * Liveness probe: verifies that the Express server process is running.
   */
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    return sendSuccess({
      res,
      statusCode: 200,
      data: {
        status: 'UP',
        service: 'Digital Wellness Hub API',
        tagline: 'Your Digital Life. Your Rules.',
        version: '0.1.0',
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  /**
   * GET /api/v1/ready
   * Readiness probe: verifies that PostgreSQL is reachable and ready to receive traffic.
   */
  app.get('/api/v1/ready', async (_req: Request, res: Response) => {
    const isDbConnected = await checkDatabaseConnection();

    if (!isDbConnected) {
      return sendError({
        res,
        statusCode: 503,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database service is currently unavailable.',
      });
    }

    return sendSuccess({
      res,
      statusCode: 200,
      data: {
        status: 'READY',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Authentication & Identity Routes
  app.use('/api/v1/auth', authRoutes);

  // Public Knowledge Base Routes
  app.use('/api/v1/resources', resourceRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/guides', guideRoutes);

  // Admin Management Routes
  app.use('/api/v1/admin', adminRoutes);

  // Student Wellness Core Routes (Phase 4)
  app.use('/api/v1/wellness', wellnessRoutes);

  // Wellness Challenges & Gamification Routes (Phase 5)
  app.use('/api/v1/challenges', challengeRoutes);

  // Community & Feedback Routes (Phase 6)
  app.use('/api/v1/community', communityRoutes);

  // Role-Protected Example Endpoints (Verifies RBAC enforcement)
  app.get(
    '/api/v1/student/overview',
    authenticateToken,
    requireRole([UserRole.STUDENT, UserRole.ADMIN]),
    (req: Request, res: Response) => {
      return sendSuccess({
        res,
        statusCode: 200,
        data: {
          message: 'Welcome to the Student Hub overview.',
          role: req.user!.role,
          userId: req.user!.sub,
        },
      });
    }
  );

  app.get(
    '/api/v1/admin/overview',
    authenticateToken,
    requireRole([UserRole.ADMIN]),
    (req: Request, res: Response) => {
      return sendSuccess({
        res,
        statusCode: 200,
        data: {
          message: 'Welcome to the Admin Control overview.',
          role: req.user!.role,
          userId: req.user!.sub,
        },
      });
    }
  );

  // 404 handler for unknown routes
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
