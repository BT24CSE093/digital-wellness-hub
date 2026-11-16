import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';
import { UserRole } from '@prisma/client';

const app = createApp();

describe('Phase 5: Wellness Challenges & Gamification Integration Tests', () => {
  const studentAData = {
    email: `student.chal.a.${Date.now()}@example.com`,
    password: 'Password123#A',
    firstName: 'Student',
    lastName: 'ChallengerA',
  };

  const studentBData = {
    email: `student.chal.b.${Date.now()}@example.com`,
    password: 'Password123#B',
    firstName: 'Student',
    lastName: 'ChallengerB',
  };

  const adminData = {
    email: `admin.chal.${Date.now()}@example.com`,
    password: 'Password123#Admin',
    firstName: 'Admin',
    lastName: 'Tester',
  };

  let tokenA: string;
  let userIdA: string;
  let tokenB: string;
  let userIdB: string;
  let adminToken: string;
  let adminUserId: string;

  let seededChallengeId: string;
  let seededChallengeSlug: string;
  let enrollmentAId: string;
  let adminCreatedChallengeId: string;

  beforeAll(async () => {
    // 1. Register Student A
    const resA = await request(app).post('/api/v1/auth/register').send(studentAData);
    expect(resA.status).toBe(201);
    userIdA = resA.body.data.user.id;
    tokenA = resA.body.data.accessToken;

    // 2. Register Student B
    const resB = await request(app).post('/api/v1/auth/register').send(studentBData);
    expect(resB.status).toBe(201);
    userIdB = resB.body.data.user.id;
    tokenB = resB.body.data.accessToken;

    // 3. Register Admin User and promote role to ADMIN in DB
    const resAdmin = await request(app).post('/api/v1/auth/register').send(adminData);
    expect(resAdmin.status).toBe(201);
    adminUserId = resAdmin.body.data.user.id;
    await prisma.user.update({
      where: { id: adminUserId },
      data: { role: UserRole.ADMIN },
    });

    // Re-login to get admin token with role claim
    const loginAdminRes = await request(app).post('/api/v1/auth/login').send({
      email: adminData.email,
      password: adminData.password,
    });
    expect(loginAdminRes.status).toBe(200);
    adminToken = loginAdminRes.body.data.accessToken;

    // 4. Find or ensure seeded challenge exists
    let challenge = await prisma.challenge.findFirst({ where: { slug: 'notification-detox' } });
    if (!challenge) {
      challenge = await prisma.challenge.create({
        data: {
          title: '7-Day Notification Detox',
          slug: 'notification-detox',
          description: 'A structured 7-day challenge to silence non-essential notification triggers.',
          durationDays: 7,
          difficulty: 'BEGINNER',
          badgeIcon: 'BellOff',
          isPublished: true,
        },
      });
    }
    seededChallengeId = challenge.id;
    seededChallengeSlug = challenge.slug;
  });

  afterAll(async () => {
    const userIds = [userIdA, userIdB, adminUserId].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.challengeEnrollment.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }

    if (adminCreatedChallengeId) {
      await prisma.challengeEnrollment.deleteMany({ where: { challengeId: adminCreatedChallengeId } });
      await prisma.challenge.deleteMany({ where: { id: adminCreatedChallengeId } });
    }

    await prisma.$disconnect();
  });

  // ==========================================
  // TASK 1: PUBLIC CHALLENGE LIBRARY
  // ==========================================
  describe('Public Challenge Library', () => {
    it('allows guests to browse published challenges (200)', async () => {
      const res = await request(app).get('/api/v1/challenges');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('filters challenges by difficulty', async () => {
      const res = await request(app).get('/api/v1/challenges?difficulty=BEGINNER');
      expect(res.status).toBe(200);
      expect(res.body.data.every((c: { difficulty: string }) => c.difficulty === 'BEGINNER')).toBe(true);
    });

    it('filters challenges by duration bounds', async () => {
      const res = await request(app).get('/api/v1/challenges?minDuration=5&maxDuration=7');
      expect(res.status).toBe(200);
      expect(
        res.body.data.every((c: { durationDays: number }) => c.durationDays >= 5 && c.durationDays <= 7)
      ).toBe(true);
    });

    it('retrieves single challenge details by slug with activities preview', async () => {
      const res = await request(app).get(`/api/v1/challenges/${seededChallengeSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(seededChallengeSlug);
      expect(Array.isArray(res.body.data.activities)).toBe(true);
      expect(res.body.data.activities.length).toBeGreaterThanOrEqual(1);
    });

    it('returns 404 for nonexistent challenge', async () => {
      const res = await request(app).get('/api/v1/challenges/non-existent-challenge-slug-12345');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // TASK 2: CHALLENGE ENROLLMENT
  // ==========================================
  describe('Challenge Enrollment & Ownership', () => {
    it('rejects unauthenticated enrollment requests (401)', async () => {
      const res = await request(app).post(`/api/v1/challenges/${seededChallengeId}/enroll`);
      expect(res.status).toBe(401);
    });

    it('enrolls Student A in challenge (201)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${seededChallengeId}/enroll`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.challengeId).toBe(seededChallengeId);
      expect(res.body.data.status).toBe('ACTIVE');
      expect(res.body.data.completedDays).toEqual([]);
      enrollmentAId = res.body.data.id;
    });

    it('prevents duplicate active enrollment in same challenge (409 Conflict)', async () => {
      const res = await request(app)
        .post(`/api/v1/challenges/${seededChallengeId}/enroll`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('lists enrolled challenges for Student A', async () => {
      const res = await request(app)
        .get('/api/v1/challenges/my')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].id).toBe(enrollmentAId);
    });

    it('SECURITY: Student B has 0 enrollments initially (cross-user isolation)', async () => {
      const res = await request(app)
        .get('/api/v1/challenges/my')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('retrieves detailed enrollment status for owner', async () => {
      const res = await request(app)
        .get(`/api/v1/challenges/my/${enrollmentAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(enrollmentAId);
      expect(res.body.data).toHaveProperty('activities');
    });

    it('SECURITY: prevents Student B from reading Student A enrollment by ID (404)', async () => {
      const res = await request(app)
        .get(`/api/v1/challenges/my/${enrollmentAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // TASK 3: CHALLENGE PROGRESS TRACKING
  // ==========================================
  describe('Challenge Progress Tracking', () => {
    it('marks day 1 activity completed for Student A (200)', async () => {
      const res = await request(app)
        .put(`/api/v1/challenges/my/${enrollmentAId}/progress`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ dayNumber: 1, completed: true });

      expect(res.status).toBe(200);
      expect(res.body.data.completedDays).toContain(1);
      expect(res.body.data.progressPercentage).toBeGreaterThan(0);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('SECURITY: prevents Student B from updating Student A challenge progress (404)', async () => {
      const res = await request(app)
        .put(`/api/v1/challenges/my/${enrollmentAId}/progress`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ dayNumber: 2, completed: true });

      expect(res.status).toBe(404);
    });

    it('rejects invalid day numbers beyond challenge duration (422)', async () => {
      const res = await request(app)
        .put(`/api/v1/challenges/my/${enrollmentAId}/progress`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ dayNumber: 99 });

      expect(res.status).toBe(422);
    });

    it('completing all days automatically transitions status to COMPLETED', async () => {
      // Complete remaining days 2 through 7
      for (let day = 2; day <= 7; day++) {
        await request(app)
          .put(`/api/v1/challenges/my/${enrollmentAId}/progress`)
          .set('Authorization', `Bearer ${tokenA}`)
          .send({ dayNumber: day, completed: true });
      }

      const res = await request(app)
        .get(`/api/v1/challenges/my/${enrollmentAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.progressPercentage).toBe(100);
      expect(res.body.data.completedDate).toBeDefined();
    });

    it('allows student to safely cancel / unenroll from a challenge', async () => {
      const res = await request(app)
        .delete(`/api/v1/challenges/${seededChallengeId}/enroll`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBeDefined();

      // Verify no longer enrolled
      const checkRes = await request(app)
        .get('/api/v1/challenges/my')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.body.data.length).toBe(0);
    });
  });

  // ==========================================
  // TASK 4 & 5: ACHIEVEMENTS & GAMIFICATION DASHBOARD
  // ==========================================
  describe('Gamification & Achievements Engine', () => {
    it('retrieves privacy-conscious achievements list for authenticated student', async () => {
      const res = await request(app)
        .get('/api/v1/challenges/achievements')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(12);

      // Verify each achievement shape
      const sample = res.body.data[0];
      expect(sample).toHaveProperty('id');
      expect(sample).toHaveProperty('title');
      expect(sample).toHaveProperty('category');
      expect(sample).toHaveProperty('isUnlocked');
      expect(sample).toHaveProperty('progress');
      expect(sample).toHaveProperty('maxProgress');
      expect(sample).toHaveProperty('percentage');
    });

    it('retrieves student gamification dashboard with encouragement and milestones', async () => {
      const res = await request(app)
        .get('/api/v1/challenges/dashboard')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('activeEnrollments');
      expect(res.body.data).toHaveProperty('completedEnrollments');
      expect(res.body.data).toHaveProperty('earnedAchievements');
      expect(res.body.data).toHaveProperty('nextMilestones');
      expect(res.body.data).toHaveProperty('encouragementMessage');
    });
  });

  // ==========================================
  // TASK 6: ADMIN CHALLENGE MANAGEMENT
  // ==========================================
  describe('Admin Challenge Management', () => {
    it('SECURITY: rejects non-admin student attempts to create challenges (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/admin')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Unauthorized Student Challenge',
          description: 'Students should not be allowed to create challenges.',
          durationDays: 5,
        });

      expect(res.status).toBe(403);
    });

    it('allows administrator to create a new challenge (201)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '3-Day Midterm Exam Focus',
          description: 'A focused challenge during exam crunch week.',
          durationDays: 3,
          difficulty: 'INTERMEDIATE',
          badgeIcon: 'Award',
          isPublished: true,
          activities: [
            { day: 1, title: 'Exam Plan', instructions: 'Map exam priorities.' },
            { day: 2, title: 'Deep Sprint', instructions: 'Do 3 focus sprints.' },
            { day: 3, title: 'Review Day', instructions: 'Final review without phones.' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('3-Day Midterm Exam Focus');
      adminCreatedChallengeId = res.body.data.id;
    });

    it('allows administrator to update a challenge', async () => {
      const res = await request(app)
        .put(`/api/v1/challenges/admin/${adminCreatedChallengeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '3-Day Midterm Exam Focus (Updated)',
          difficulty: 'ADVANCED',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('3-Day Midterm Exam Focus (Updated)');
      expect(res.body.data.difficulty).toBe('ADVANCED');
    });

    it('allows administrator to toggle publication status', async () => {
      const res = await request(app)
        .patch(`/api/v1/challenges/admin/${adminCreatedChallengeId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
    });

    it('allows administrator to retrieve aggregate challenge stats', async () => {
      const res = await request(app)
        .get('/api/v1/challenges/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalChallenges');
      expect(res.body.data).toHaveProperty('totalEnrollments');
    });

    it('allows administrator to delete challenge', async () => {
      const res = await request(app)
        .delete(`/api/v1/challenges/admin/${adminCreatedChallengeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      adminCreatedChallengeId = '';
    });
  });
});
