import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password.util';
import { REFRESH_COOKIE_NAME } from '../utils/cookie.util';
import { UserRole } from '@prisma/client';

const app = createApp();

describe('Authentication & Identity Management (Phase 2)', () => {
  const testStudent = {
    email: 'auth_test_student@university.edu',
    password: 'Password123!#',
    firstName: 'Jordan',
    lastName: 'Taylor',
  };

  const testAdmin = {
    email: 'auth_test_admin@university.edu',
    password: 'AdminPassword456!#',
    firstName: 'Admin',
    lastName: 'Supervisor',
  };

  const testInactive = {
    email: 'auth_test_inactive@university.edu',
    password: 'InactivePassword789!#',
    firstName: 'Inactive',
    lastName: 'User',
  };

  beforeAll(async () => {
    // Clean up any existing test records
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testStudent.email, testAdmin.email, testInactive.email, 'duplicate_test@university.edu'],
        },
      },
    });

    // Seed test admin
    const adminPasswordHash = await hashPassword(testAdmin.password);
    await prisma.user.create({
      data: {
        email: testAdmin.email,
        passwordHash: adminPasswordHash,
        firstName: testAdmin.firstName,
        lastName: testAdmin.lastName,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    // Seed test inactive user
    const inactivePasswordHash = await hashPassword(testInactive.password);
    await prisma.user.create({
      data: {
        email: testInactive.email,
        passwordHash: inactivePasswordHash,
        firstName: testInactive.firstName,
        lastName: testInactive.lastName,
        role: UserRole.STUDENT,
        isActive: false,
      },
    });
  });

  afterAll(async () => {
    // Clean up created test records
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testStudent.email, testAdmin.email, testInactive.email, 'duplicate_test@university.edu'],
        },
      },
    });
    await prisma.$disconnect();
  });

  // =========================================================================
  // 1. REGISTRATION TESTS
  // =========================================================================
  describe('A. User Registration (POST /api/v1/auth/register)', () => {
    it('successfully registers a valid new student account', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testStudent.email);
      expect(res.body.data.user.role).toBe('STUDENT');
      expect(res.body.data.user.firstName).toBe('Jordan');
      expect(res.body.data.user.lastName).toBe('Taylor');

      // Security check: Never return passwordHash
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.password).toBeUndefined();

      // Cookie check: Refresh token cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = (cookies as unknown as string[]).find((c) =>
        c.startsWith(`${REFRESH_COOKIE_NAME}=`)
      );
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    it('rejects registration with a duplicate email (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('rejects registration with an invalid email format (422 Unprocessable)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testStudent,
          email: 'not-an-email',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects registration with a weak password (422 Unprocessable)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testStudent,
          email: 'weakpass@university.edu',
          password: 'weak',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('stores password in database as Argon2id hash, not plaintext', async () => {
      const dbUser = await prisma.user.findUnique({
        where: { email: testStudent.email },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser!.passwordHash).toMatch(/^\$argon2id\$/);
      expect(dbUser!.passwordHash).not.toContain(testStudent.password);
    });
  });

  // =========================================================================
  // 2. LOGIN TESTS
  // =========================================================================
  describe('B. User Login (POST /api/v1/auth/login)', () => {
    it('successfully logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testStudent.email);
      expect(res.body.data.user.passwordHash).toBeUndefined();

      // Cookie check
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = (cookies as unknown as string[]).find((c) =>
        c.startsWith(`${REFRESH_COOKIE_NAME}=`)
      );
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    it('returns generic error on incorrect password to prevent enumeration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password.');
    });

    it('returns generic error for nonexistent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent_person_12345@university.edu',
          password: 'SomePassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password.');
    });

    it('rejects login for deactivated/inactive accounts (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testInactive.email,
          password: testInactive.password,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACCOUNT_DEACTIVATED');
    });
  });

  // =========================================================================
  // 3. REFRESH TOKEN ROTATION & REUSE DETECTION TESTS
  // =========================================================================
  describe('C. Refresh Token Rotation & Reuse Detection (POST /api/v1/auth/refresh)', () => {
    let activeRefreshCookie: string;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password,
        });

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      activeRefreshCookie = cookies.find((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`))!;
    });

    it('successfully rotates refresh token and issues fresh access token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', activeRefreshCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testStudent.email);

      // Verify a new cookie was returned
      const newCookies = res.headers['set-cookie'] as unknown as string[];
      const newRefreshCookie = newCookies.find((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`))!;
      expect(newRefreshCookie).toBeDefined();

      // Old cookie value must be different from new cookie value
      const oldVal = activeRefreshCookie.split(';')[0];
      const newVal = newRefreshCookie.split(';')[0];
      expect(oldVal).not.toBe(newVal);

      // Update active cookie to the newly rotated one
      activeRefreshCookie = newRefreshCookie;
    });

    it('detects token reuse and revokes entire token family (Security violation)', async () => {
      // 1. First refresh with active cookie -> succeeds and rotates
      const firstRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', activeRefreshCookie);

      expect(firstRes.status).toBe(200);
      const rotatedCookie = (firstRes.headers['set-cookie'] as unknown as string[]).find((c) =>
        c.startsWith(`${REFRESH_COOKIE_NAME}=`)
      )!;

      // 2. An attacker tries to REUSE the now-burned activeRefreshCookie!
      const replayRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', activeRefreshCookie);

      expect(replayRes.status).toBe(401);
      expect(replayRes.body.success).toBe(false);
      expect(replayRes.body.error.code).toBe('TOKEN_REUSE_DETECTED');

      // 3. Compromise recovery: The legitimate rotated cookie should NOW ALSO BE REVOKED!
      const subsequentRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', rotatedCookie);

      expect(subsequentRes.status).toBe(401);
    });

    it('rejects refresh request when no cookie is presented (401 Unauthorized)', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REFRESH_TOKEN_REQUIRED');
    });

    it('rejects fake/malicious refresh token string', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `${REFRESH_COOKIE_NAME}=definitely_not_a_real_token_hash_value_1234567890`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  // =========================================================================
  // 4. LOGOUT TESTS
  // =========================================================================
  describe('D. User Logout (POST /api/v1/auth/logout)', () => {
    it('successfully revokes refresh token and clears cookie', async () => {
      // 1. Log in to get fresh cookie
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password,
        });

      const refreshCookie = (loginRes.headers['set-cookie'] as unknown as string[]).find((c) =>
        c.startsWith(`${REFRESH_COOKIE_NAME}=`)
      )!;

      // 2. Call logout
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', refreshCookie);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Verify cookie is cleared (maxAge=0 or expired date)
      const clearCookies = logoutRes.headers['set-cookie'] as unknown as string[];
      const clearedCookie = clearCookies.find((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`))!;
      expect(clearedCookie).toBeDefined();

      // 3. Trying to refresh with the logged-out cookie must fail
      const refreshAttempt = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie);

      expect(refreshAttempt.status).toBe(401);
    });
  });

  // =========================================================================
  // 5. CURRENT USER PROFILE (GET /api/v1/auth/me)
  // =========================================================================
  describe('E. Authenticated Profile (GET /api/v1/auth/me)', () => {
    let studentAccessToken: string;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password,
        });

      studentAccessToken = loginRes.body.data.accessToken;
    });

    it('returns current user profile for valid access token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testStudent.email);
      expect(res.body.data.user.firstName).toBe(testStudent.firstName);
      expect(res.body.data.user.role).toBe('STUDENT');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('rejects unauthenticated request (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects invalid or tampered access token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.tampered.token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  // =========================================================================
  // 6. ROLE-BASED ACCESS CONTROL (RBAC) TESTS
  // =========================================================================
  describe('F. Role-Based Access Control (RBAC)', () => {
    let studentAccessToken: string;
    let adminAccessToken: string;

    beforeAll(async () => {
      // Login student
      const studentLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password,
        });
      studentAccessToken = studentLogin.body.data.accessToken;

      // Login admin
      const adminLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
        });
      adminAccessToken = adminLogin.body.data.accessToken;
    });

    it('allows student to access student-protected endpoint (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/student/overview')
        .set('Authorization', `Bearer ${studentAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('STUDENT');
    });

    it('allows admin to access admin-only endpoint (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('blocks student from accessing admin-only endpoint (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${studentAccessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('blocks unauthenticated request from accessing role-protected endpoint (401)', async () => {
      const res = await request(app).get('/api/v1/admin/overview');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
