import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { wellnessController } from './wellness.controller';

const router = Router();

// All wellness endpoints require authentication
router.use(authenticateToken);

// ==========================================
// Focus Sessions
// ==========================================
router.post('/focus-sessions', (req, res) => wellnessController.createFocusSession(req, res));
router.get('/focus-sessions', (req, res) => wellnessController.listFocusSessions(req, res));
router.get('/focus-sessions/:id', (req, res) => wellnessController.getFocusSessionById(req, res));
router.delete('/focus-sessions/:id', (req, res) => wellnessController.deleteFocusSession(req, res));
router.get('/focus-summary', (req, res) => wellnessController.getFocusSummary(req, res));

// ==========================================
// Screen Time Tracking & Goals
// ==========================================
router.post('/screen-time', (req, res) => wellnessController.createScreenTimeLog(req, res));
router.get('/screen-time', (req, res) => wellnessController.listScreenTimeLogs(req, res));
router.get('/screen-time-summary', (req, res) => wellnessController.getScreenTimeSummary(req, res));
router.get('/screen-time/summary', (req, res) => wellnessController.getScreenTimeSummary(req, res));
router.get('/screen-time-goals', (req, res) => wellnessController.getScreenTimeGoal(req, res));
router.get('/screen-time-goal', (req, res) => wellnessController.getScreenTimeGoal(req, res));
router.put('/screen-time-goals', (req, res) => wellnessController.upsertScreenTimeGoal(req, res));
router.put('/screen-time-goal', (req, res) => wellnessController.upsertScreenTimeGoal(req, res));
router.get('/screen-time/:id', (req, res) => wellnessController.getScreenTimeLogById(req, res));
router.put('/screen-time/:id', (req, res) => wellnessController.updateScreenTimeLog(req, res));
router.delete('/screen-time/:id', (req, res) => wellnessController.deleteScreenTimeLog(req, res));

// ==========================================
// Digital Wellness Self-Assessment
// ==========================================
router.post('/assessments', (req, res) => wellnessController.submitAssessment(req, res));
router.get('/assessments', (req, res) => wellnessController.listAssessments(req, res));
router.get('/assessments/latest', (req, res) => wellnessController.getLatestAssessment(req, res));
router.get('/assessments/:id', (req, res) => wellnessController.getAssessmentById(req, res));

// ==========================================
// Daily Planner
// ==========================================
router.get('/planner', (req, res) => wellnessController.getDailyPlanner(req, res));
router.post('/planner', (req, res) => wellnessController.upsertDailyPlanner(req, res));
router.get('/planner/recent', (req, res) => wellnessController.getRecentDailyPlanners(req, res));
router.put('/planner/:date', (req, res) => wellnessController.updateDailyPlanner(req, res));

// ==========================================
// Dashboard Summary
// ==========================================
router.get('/dashboard-summary', (req, res) => wellnessController.getDashboardSummary(req, res));

export { router as wellnessRoutes };
