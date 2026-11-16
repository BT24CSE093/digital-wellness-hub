import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { plannerController } from './planner.controller';

const router = Router();
router.use(authenticateToken);

router.put('/', (req, res) => plannerController.upsertPlan(req, res));
router.get('/recent', (req, res) => plannerController.getRecentPlans(req, res));
router.get('/:date', (req, res) => plannerController.getPlanByDate(req, res));
router.patch('/:date', (req, res) => plannerController.updatePlan(req, res));

export { router as plannerRoutes };
