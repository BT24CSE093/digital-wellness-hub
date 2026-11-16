import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../../utils/jwt.util';
import { challengesController } from './challenges.controller';

const router = Router();

// Optional authentication helper for public browsing
function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore token failure for public routes
    }
  }
  next();
}

// ==========================================
// ADMIN ROUTES (Must come before :id param routes)
// ==========================================
router.post(
  '/admin',
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  (req, res) => challengesController.createChallenge(req, res)
);

router.put(
  '/admin/:id',
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  (req, res) => challengesController.updateChallenge(req, res)
);

router.patch(
  '/admin/:id/publish',
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  (req, res) => challengesController.togglePublish(req, res)
);

router.delete(
  '/admin/:id',
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  (req, res) => challengesController.deleteChallenge(req, res)
);

router.get(
  '/admin/stats',
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  (req, res) => challengesController.getAdminStats(req, res)
);

// ==========================================
// STUDENT PROTECTED ENROLLMENT & PROGRESS ROUTES
// ==========================================
router.get(
  '/my',
  authenticateToken,
  (req, res) => challengesController.listMyEnrollments(req, res)
);

router.get(
  '/my/:enrollmentId',
  authenticateToken,
  (req, res) => challengesController.getMyEnrollmentDetail(req, res)
);

router.put(
  '/my/:enrollmentId/progress',
  authenticateToken,
  (req, res) => challengesController.updateProgress(req, res)
);

router.get(
  '/achievements',
  authenticateToken,
  (req, res) => challengesController.getAchievements(req, res)
);

router.get(
  '/dashboard',
  authenticateToken,
  (req, res) => challengesController.getGamificationDashboard(req, res)
);

router.post(
  '/:id/enroll',
  authenticateToken,
  (req, res) => challengesController.enroll(req, res)
);

router.delete(
  '/:id/enroll',
  authenticateToken,
  (req, res) => challengesController.cancelEnrollment(req, res)
);

// ==========================================
// PUBLIC CHALLENGE DISCOVERY ROUTES
// ==========================================
router.get(
  '/',
  optionalAuth,
  (req, res) => challengesController.listChallenges(req, res)
);

router.get(
  '/:id',
  optionalAuth,
  (req, res) => challengesController.getChallenge(req, res)
);

export { router as challengeRoutes };
