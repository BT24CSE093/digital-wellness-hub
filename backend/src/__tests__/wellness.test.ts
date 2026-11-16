import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';

const app = createApp();

describe('Phase 4: Student Wellness Core Integration Tests', () => {
  const userAData = {
    email: `student.a.${Date.now()}@example.com`,
    password: 'Password123#A',
    firstName: 'Student',
    lastName: 'One',
  };

  const userBData = {
    email: `student.b.${Date.now()}@example.com`,
    password: 'Password123#B',
    firstName: 'Student',
    lastName: 'Two',
  };

  let tokenA: string;
  let userIdA: string;
  let tokenB: string;
  let userIdB: string;

  beforeAll(async () => {
    // Register Student A
    const resA = await request(app).post('/api/v1/auth/register').send(userAData);
    expect(resA.status).toBe(201);
    userIdA = resA.body.data.user.id;
    tokenA = resA.body.data.accessToken;

    // Register Student B
    const resB = await request(app).post('/api/v1/auth/register').send(userBData);
    expect(resB.status).toBe(201);
    userIdB = resB.body.data.user.id;
    tokenB = resB.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup records for both test users
    const userIds = [userIdA, userIdB].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.dailyPlanner.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.wellnessAssessment.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.screenTimeGoal.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.screenTimeLog.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.focusSession.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  });

  // ==========================================
  // TASK 1: FOCUS TIMER
  // ==========================================
  describe('Focus Sessions', () => {
    let sessionAId: string;

    it('should reject unauthenticated request to focus endpoints with 401', async () => {
      const res = await request(app).get('/api/v1/wellness/focus-sessions');
      expect(res.status).toBe(401);
    });

    it('should reject focus session creation with invalid duration (422)', async () => {
      const res = await request(app)
        .post('/api/v1/wellness/focus-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          durationMinutes: 0,
        });
      expect(res.status).toBe(422);
    });

    it('should create a focus session for Student A (201)', async () => {
      const res = await request(app)
        .post('/api/v1/wellness/focus-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          durationMinutes: 25,
          sessionType: 'POMODORO',
          intention: 'Complete Biology Chapter 4 Notes',
          distractionsCount: 1,
          focusRating: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.durationMinutes).toBe(25);
      expect(res.body.data.intention).toBe('Complete Biology Chapter 4 Notes');
      expect(res.body.data.userId).toBe(userIdA);
      sessionAId = res.body.data.id;
    });

    it('should retrieve focus session list for Student A with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/focus-sessions')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve single focus session by ID for owner', async () => {
      const res = await request(app)
        .get(`/api/v1/wellness/focus-sessions/${sessionAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(sessionAId);
    });

    it('SECURITY: should prevent Student B from viewing Student A focus session (404)', async () => {
      const res = await request(app)
        .get(`/api/v1/wellness/focus-sessions/${sessionAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });

    it('SECURITY: should prevent Student B from deleting Student A focus session (404)', async () => {
      const res = await request(app)
        .delete(`/api/v1/wellness/focus-sessions/${sessionAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });

    it('should return focus summary metrics and weekly trend for Student A', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/focus-summary')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.todayMinutes).toBeGreaterThanOrEqual(25);
      expect(res.body.data.todaySessions).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.data.weeklyTrend)).toBe(true);
      expect(res.body.data.weeklyTrend.length).toBe(7);
    });

    it('should delete own focus session for Student A', async () => {
      const res = await request(app)
        .delete(`/api/v1/wellness/focus-sessions/${sessionAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBeDefined();
    });
  });

  // ==========================================
  // TASK 2 & 3: SCREEN-TIME TRACKING & GOALS
  // ==========================================
  describe('Screen-Time Tracking & Goals', () => {
    let logAId: string;
    const testDate = '2026-11-02';

    it('should set screen-time goal for Student A', async () => {
      const res = await request(app)
        .put('/api/v1/wellness/screen-time-goals')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          maxDailyMinutes: 240,
          maxDistractingMinutes: 60,
          targetBedtimeHour: 22,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.maxDailyMinutes).toBe(240);
      expect(res.body.data.targetBedtimeHour).toBe(22);
    });

    it('should get screen-time goal for Student A', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/screen-time-goals')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.maxDailyMinutes).toBe(240);
    });

    it('SECURITY: Student B should get default goal and not see Student A custom goal', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/screen-time-goals')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      // Student B hasn't set custom goal, defaults to 360
      expect(res.body.data.maxDailyMinutes).toBe(360);
    });

    it('should log screen time for Student A', async () => {
      const res = await request(app)
        .post('/api/v1/wellness/screen-time')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          logDate: testDate,
          totalMinutes: 180,
          productiveMinutes: 120,
          distractingMinutes: 60,
          pickupsCount: 35,
          categoryBreakdown: {
            education: 90,
            productivity: 30,
            socialMedia: 45,
            entertainment: 15,
          },
          notes: 'Heavy study day on campus',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.totalMinutes).toBe(180);
      expect(res.body.data.userId).toBe(userIdA);
      logAId = res.body.data.id;
    });

    it('should retrieve screen-time logs list for Student A', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/screen-time')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('SECURITY: should prevent Student B from reading Student A screen-time log (404)', async () => {
      const res = await request(app)
        .get(`/api/v1/wellness/screen-time/${logAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });

    it('SECURITY: should prevent Student B from modifying Student A screen-time log (404)', async () => {
      const res = await request(app)
        .put(`/api/v1/wellness/screen-time/${logAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ totalMinutes: 999 });

      expect(res.status).toBe(404);
    });

    it('should update own screen-time log for Student A', async () => {
      const res = await request(app)
        .put(`/api/v1/wellness/screen-time/${logAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          totalMinutes: 200,
          notes: 'Updated study log after evening session',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.totalMinutes).toBe(200);
      expect(res.body.data.notes).toBe('Updated study log after evening session');
    });

    it('should return screen-time summary with goal progress and remaining time', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/screen-time-summary')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('goal');
      expect(res.body.data).toHaveProperty('remainingMinutes');
      expect(res.body.data).toHaveProperty('isExceeded');
      expect(res.body.data).toHaveProperty('weeklyTrend');
      expect(res.body.data.weeklyTrend.length).toBe(7);
    });

    it('should reject screen-time creation with invalid minutes > 1440 (422)', async () => {
      const res = await request(app)
        .post('/api/v1/wellness/screen-time')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ totalMinutes: 1500 });

      expect(res.status).toBe(422);
    });

    it('should delete screen-time log for Student A', async () => {
      const res = await request(app)
        .delete(`/api/v1/wellness/screen-time/${logAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBeDefined();
    });
  });

  // ==========================================
  // TASK 4: DIGITAL WELLNESS ASSESSMENT
  // ==========================================
  describe('Digital Wellness Self-Assessment', () => {
    let assessmentAId: string;

    const sampleResponses = [
      { questionId: 'sta_1', dimensionId: 'screenTimeAwareness', score: 4 },
      { questionId: 'sta_2', dimensionId: 'screenTimeAwareness', score: 3 },
      { questionId: 'fb_1', dimensionId: 'focusBehavior', score: 5 },
      { questionId: 'fb_2', dimensionId: 'focusBehavior', score: 4 },
      { questionId: 'dh_1', dimensionId: 'deviceHabits', score: 3 },
      { questionId: 'dh_2', dimensionId: 'deviceHabits', score: 4 },
      { questionId: 'sr_1', dimensionId: 'sleepAndRestoration', score: 2 },
      { questionId: 'sr_2', dimensionId: 'sleepAndRestoration', score: 3 },
      { questionId: 'sb_1', dimensionId: 'socialDigitalBalance', score: 5 },
      { questionId: 'sb_2', dimensionId: 'socialDigitalBalance', score: 4 },
    ];

    it('should submit assessment, calculate scores and tier, and return educational advice', async () => {
      const res = await request(app)
        .post('/api/v1/wellness/assessments')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ responses: sampleResponses });

      expect(res.status).toBe(201);
      expect(res.body.data.overallScore).toBeGreaterThan(0);
      expect(res.body.data).toHaveProperty('calculatedTier');
      expect(res.body.data).toHaveProperty('recommendations');
      expect(res.body.data).toHaveProperty('disclaimer');
      expect(res.body.data.disclaimer).toContain('educational');
      assessmentAId = res.body.data.id;
    });

    it('should retrieve latest assessment for Student A', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/assessments/latest')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(assessmentAId);
    });

    it('SECURITY: should prevent Student B from accessing Student A assessment by ID (404)', async () => {
      const res = await request(app)
        .get(`/api/v1/wellness/assessments/${assessmentAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });

    it('should reject assessment with empty responses (422)', async () => {
      const res = await request(app)
        .post('/api/v1/wellness/assessments')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ responses: [] });

      expect(res.status).toBe(422);
    });
  });

  // ==========================================
  // TASK 5: DAILY PLANNER
  // ==========================================
  describe('Daily Planner', () => {
    const planDate = '2026-11-02';

    it('should upsert daily planner with digital intention and tasks for Student A', async () => {
      const res = await request(app)
        .post('/api/v1/wellness/planner')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          planDate,
          digitalIntention: 'Zero phone checks during lecture hours',
          priorityTasks: [
            { id: 'task-1', text: 'Read OS textbook chapter 3', priority: 'HIGH', completed: false },
            { id: 'task-2', text: 'Submit database assignment', priority: 'HIGH', completed: false },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.digitalIntention).toBe('Zero phone checks during lecture hours');
      expect(res.body.data.userId).toBe(userIdA);
    });

    it('should retrieve plan for specified date for Student A', async () => {
      const res = await request(app)
        .get(`/api/v1/wellness/planner?date=${planDate}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.digitalIntention).toBe('Zero phone checks during lecture hours');
    });

    it('SECURITY: Student B querying plan for that date should get null', async () => {
      const res = await request(app)
        .get(`/api/v1/wellness/planner?date=${planDate}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
    });

    it('should update daily planner tasks and digital shutdown status for Student A', async () => {
      const res = await request(app)
        .put(`/api/v1/wellness/planner/${planDate}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          shutdownCompleted: true,
          priorityTasks: [
            { id: 'task-1', text: 'Read OS textbook chapter 3', priority: 'HIGH', completed: true },
            { id: 'task-2', text: 'Submit database assignment', priority: 'HIGH', completed: true },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.shutdownCompleted).toBe(true);
      expect(res.body.data.shutdownAt).toBeDefined();
    });

    it('should retrieve recent planners list for Student A', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/planner/recent')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // TASK 6: DASHBOARD SUMMARY
  // ==========================================
  describe('Student Wellness Dashboard Summary', () => {
    it('should return aggregated dashboard data for authenticated student', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/dashboard-summary')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('focus');
      expect(res.body.data).toHaveProperty('screenTime');
      expect(res.body.data).toHaveProperty('assessment');
      expect(res.body.data).toHaveProperty('planner');
      expect(res.body.data.focus).toHaveProperty('todayMinutes');
      expect(res.body.data.screenTime).toHaveProperty('goal');
    });

    it('SECURITY: Student B dashboard summary should be empty/isolated from Student A data', async () => {
      const res = await request(app)
        .get('/api/v1/wellness/dashboard-summary')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.focus.todayMinutes).toBe(0);
      expect(res.body.data.focus.totalSessions).toBe(0);
      expect(res.body.data.assessment).toBeNull();
      expect(res.body.data.planner).toBeNull();
    });
  });
});
