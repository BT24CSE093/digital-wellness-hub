import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { screenTimeController } from './screentime.controller';

const router = Router();
router.use(authenticateToken);

router.put('/log', (req, res) => screenTimeController.upsertLog(req, res));
router.get('/logs', (req, res) => screenTimeController.getLogs(req, res));
router.get('/today', (req, res) => screenTimeController.getTodayLog(req, res));
router.put('/goal', (req, res) => screenTimeController.upsertGoal(req, res));
router.get('/goal', (req, res) => screenTimeController.getGoal(req, res));
router.get('/weekly', (req, res) => screenTimeController.getWeeklyStats(req, res));

export { router as screenTimeRoutes };
