import { Router } from 'express';
import { communityController } from './community.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { generalRateLimiter } from '../../middleware/rateLimiter.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Student Protected Endpoints
router.use(authenticateToken);

router.post('/suggestions', generalRateLimiter, (req, res) => communityController.suggestResource(req, res));
router.post('/feedback', generalRateLimiter, (req, res) => communityController.submitFeedback(req, res));
router.post('/reports', generalRateLimiter, (req, res) => communityController.submitReport(req, res));
router.get('/my-submissions', (req, res) => communityController.getMySubmissions(req, res));

// Admin Moderation Endpoints
router.use(requireRole([UserRole.ADMIN]));

router.get('/admin/suggestions', (req, res) => communityController.listAdminSuggestions(req, res));
router.patch('/admin/suggestions/:id', (req, res) => communityController.moderateSuggestion(req, res));

router.get('/admin/feedback', (req, res) => communityController.listAdminFeedback(req, res));
router.patch('/admin/feedback/:id', (req, res) => communityController.moderateFeedback(req, res));

router.get('/admin/reports', (req, res) => communityController.listAdminReports(req, res));
router.patch('/admin/reports/:id', (req, res) => communityController.moderateReport(req, res));

export default router;
