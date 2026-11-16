import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { focusController } from './focus.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', (req, res) => focusController.logSession(req, res));
router.get('/', (req, res) => focusController.listSessions(req, res));
router.get('/stats', (req, res) => focusController.getStats(req, res));
router.get('/trend', (req, res) => focusController.getWeeklyTrend(req, res));
router.delete('/:id', (req, res) => focusController.deleteSession(req, res));

export { router as focusRoutes };
