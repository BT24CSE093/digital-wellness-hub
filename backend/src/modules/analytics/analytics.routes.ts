import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { analyticsController } from './analytics.controller';

const router = Router();
router.use(authenticateToken);

router.get('/summary', (req, res) => analyticsController.getDashboardSummary(req, res));
router.get('/focus/trend', (req, res) => analyticsController.getWeeklyFocusTrend(req, res));
router.get('/screentime/trend', (req, res) => analyticsController.getWeeklyScreenTimeTrend(req, res));

export { router as analyticsRoutes };
