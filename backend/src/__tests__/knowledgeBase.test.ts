import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';
import { signAccessToken } from '../utils/jwt.util';
import { UserRole, PricingModel, Platform, Difficulty } from '@prisma/client';

const app = createApp();

describe('Public Knowledge Base & Admin Content Management (Phase 3)', () => {
  let adminToken: string;
  let studentToken: string;
  let adminUserId: string;
  let studentUserId: string;
  let testCategoryId: string;
  let testResourceId: string;
  let testGuideId: string;

  beforeAll(async () => {
    // 1. Create or retrieve test admin
    let admin = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'kb_test_admin@university.edu',
          firstName: 'Admin',
          lastName: 'Tester',
          role: UserRole.ADMIN,
          passwordHash: 'dummy_hash',
        },
      });
    }
    adminUserId = admin.id;
    adminToken = signAccessToken({
      sub: admin.id,
      email: admin.email,
      role: UserRole.ADMIN,
    });

    // 2. Create or retrieve test student
    let student = await prisma.user.findFirst({ where: { role: UserRole.STUDENT } });
    if (!student) {
      student = await prisma.user.create({
        data: {
          email: 'kb_test_student@university.edu',
          firstName: 'Student',
          lastName: 'Tester',
          role: UserRole.STUDENT,
          passwordHash: 'dummy_hash',
        },
      });
    }
    studentUserId = student.id;
    studentToken = signAccessToken({
      sub: student.id,
      email: student.email,
      role: UserRole.STUDENT,
    });

    // 3. Ensure test category exists
    const category = await prisma.category.upsert({
      where: { slug: 'test-category' },
      update: {},
      create: {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Category for testing knowledge base endpoints',
      },
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    // Clean up created test resources / guides / category
    if (testResourceId) {
      await prisma.resource.deleteMany({ where: { id: testResourceId } });
    }
    if (testGuideId) {
      await prisma.deviceGuide.deleteMany({ where: { id: testGuideId } });
    }
    await prisma.resource.deleteMany({ where: { slug: { in: ['test-created-tool', 'test-created-tool-updated'] } } });
    await prisma.deviceGuide.deleteMany({ where: { slug: { in: ['test-created-guide', 'test-created-guide-updated'] } } });
    await prisma.category.deleteMany({ where: { slug: { in: ['test-category', 'test-new-category'] } } });
  });

  describe('1. Public Resource Library Endpoints', () => {
    it('GET /api/v1/resources - returns paginated resources with metadata', async () => {
      const res = await request(app).get('/api/v1/resources?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.totalPages).toBeGreaterThanOrEqual(1);

      // Verify structure of a resource item
      const item = res.body.data[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('slug');
      expect(item).toHaveProperty('tagline');
      expect(item).toHaveProperty('pricingModel');
      expect(item).toHaveProperty('platforms');
      expect(item).toHaveProperty('category');
    });

    it('GET /api/v1/resources - filters by search term', async () => {
      const res = await request(app).get('/api/v1/resources?search=Cold+Turkey');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('Cold Turkey');
    });

    it('GET /api/v1/resources - filters by pricingModel and platform', async () => {
      const res = await request(app).get('/api/v1/resources?pricingModel=FREE&platform=WINDOWS');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const item of res.body.data) {
        expect(item.pricingModel).toBe('FREE');
        expect(item.platforms).toContain('WINDOWS');
      }
    });

    it('GET /api/v1/resources - filters by verification status', async () => {
      const res = await request(app).get('/api/v1/resources?isVerified=true');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const item of res.body.data) {
        expect(item.isVerified).toBe(true);
      }
    });

    it('GET /api/v1/resources/:id - returns full details by slug', async () => {
      const res = await request(app).get('/api/v1/resources/cold-turkey-blocker');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('cold-turkey-blocker');
      expect(res.body.data.category).toBeDefined();
    });

    it('GET /api/v1/resources/:id - returns 404 for nonexistent resource', async () => {
      const res = await request(app).get('/api/v1/resources/nonexistent-resource-slug');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('GET /api/v1/categories - returns all categories with resource counts', async () => {
      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]).toHaveProperty('_count');
    });
  });

  describe('2. Public Guide Endpoints', () => {
    it('GET /api/v1/guides - returns only published guides', async () => {
      const res = await request(app).get('/api/v1/guides');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      for (const guide of res.body.data) {
        expect(guide.isPublished).toBe(true);
      }
      // Verify draft guide is not in public list
      const draft = res.body.data.find((g: any) => g.slug === 'linux-dns-hostfile-blocking-draft');
      expect(draft).toBeUndefined();
    });

    it('GET /api/v1/guides - filters by platform', async () => {
      const res = await request(app).get('/api/v1/guides?platform=IOS');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const guide of res.body.data) {
        expect(guide.platform).toBe('IOS');
      }
    });

    it('GET /api/v1/guides/:slug - returns guide detail and related guides', async () => {
      const res = await request(app).get('/api/v1/guides/ios-scheduled-grayscale');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.guide).toBeDefined();
      expect(res.body.data.guide.slug).toBe('ios-scheduled-grayscale');
      expect(Array.isArray(res.body.data.guide.steps)).toBe(true);
      expect(res.body.data.guide.steps.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.relatedGuides).toBeDefined();
    });

    it('GET /api/v1/guides/:slug - returns 404 for unpublished draft accessed publicly', async () => {
      const res = await request(app).get('/api/v1/guides/linux-dns-hostfile-blocking-draft');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('GUIDE_NOT_FOUND');
    });
  });

  describe('3. Admin Content Management & RBAC Security', () => {
    it('POST /api/v1/admin/resources - fails with 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/v1/admin/resources')
        .send({ title: 'Unauthorized Tool' });
      expect(res.status).toBe(401);
    });

    it('POST /api/v1/admin/resources - fails with 403 when authenticated as STUDENT', async () => {
      const res = await request(app)
        .post('/api/v1/admin/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Tool',
          tagline: 'Should be rejected',
          description: 'Students cannot create resources directly.',
          websiteUrl: 'https://example.com',
          pricingModel: 'FREE',
          platforms: ['WINDOWS'],
          categoryId: testCategoryId,
        });
      expect(res.status).toBe(403);
    });

    it('POST /api/v1/admin/resources - succeeds when authenticated as ADMIN', async () => {
      const res = await request(app)
        .post('/api/v1/admin/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Created Tool',
          slug: 'test-created-tool',
          tagline: 'A tool created by admin in automated testing',
          description: 'Detailed description of the tool for testing purposes.',
          websiteUrl: 'https://example.com/test-tool',
          pricingModel: 'FREE',
          platforms: ['MACOS', 'LINUX'],
          categoryId: testCategoryId,
          isVerified: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Created Tool');
      testResourceId = res.body.data.id;
    });

    it('PATCH /api/v1/admin/resources/:id/verify - toggles verification', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/resources/${testResourceId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isVerified: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isVerified).toBe(true);
      expect(res.body.data.verifiedByUserId).toBe(adminUserId);
    });

    it('PUT /api/v1/admin/resources/:id - updates resource details', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/resources/${testResourceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tagline: 'Updated tool tagline by admin',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tagline).toBe('Updated tool tagline by admin');
    });

    it('DELETE /api/v1/admin/resources/:id - deletes resource', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/resources/${testResourceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it's gone
      const verifyRes = await request(app).get(`/api/v1/resources/${testResourceId}`);
      expect(verifyRes.status).toBe(404);
      testResourceId = '';
    });

    it('GET /api/v1/admin/guides - lists all guides including unpublished drafts', async () => {
      const res = await request(app)
        .get('/api/v1/admin/guides')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const draft = res.body.data.find((g: any) => g.slug === 'linux-dns-hostfile-blocking-draft');
      expect(draft).toBeDefined();
      expect(draft.isPublished).toBe(false);
    });

    it('POST /api/v1/admin/guides - creates a new guide', async () => {
      const res = await request(app)
        .post('/api/v1/admin/guides')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Created Guide',
          slug: 'test-created-guide',
          platform: 'WINDOWS',
          difficulty: 'BEGINNER',
          estimatedMinutes: 5,
          steps: [
            {
              stepNumber: 1,
              title: 'First Step',
              instruction: 'Follow this instruction carefully.',
            },
          ],
          isPublished: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Created Guide');
      testGuideId = res.body.data.id;
    });

    it('PATCH /api/v1/admin/guides/:id/publish - toggles publication status', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/guides/${testGuideId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isPublished).toBe(true);
    });

    it('DELETE /api/v1/admin/guides/:id - deletes guide', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/guides/${testGuideId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      testGuideId = '';
    });
  });

  describe('4. Input Validation & Error Handling', () => {
    it('POST /api/v1/admin/resources - returns 422 on invalid URL or missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/admin/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Bad Tool',
          tagline: 'Too short',
          description: 'Short',
          websiteUrl: 'not-a-url',
          pricingModel: 'INVALID_PRICING',
          platforms: [],
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.error.details)).toBe(true);
    });
  });
});
