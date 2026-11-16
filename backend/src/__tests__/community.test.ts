import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';
import { Application } from 'express';

describe('Phase 6: Community, Feedback & Resource Contributions', () => {
  let app: Application;
  let studentToken: string;
  let adminToken: string;
  let studentId: string;
  let categoryId: string;
  let suggestionId: string;
  let feedbackId: string;
  let reportId: string;

  beforeAll(async () => {
    app = createApp();

    // Clean up
    await prisma.contentReport.deleteMany();
    await prisma.feedbackSubmission.deleteMany();
    await prisma.resourceSuggestion.deleteMany();

    // Student account
    const studentEmail = `comm_student_${Date.now()}@example.com`;
    const studentRes = await request(app).post('/api/v1/auth/register').send({
      email: studentEmail,
      password: 'Password123!',
      firstName: 'Community',
      lastName: 'Student',
    });
    studentToken = studentRes.body.data.accessToken;
    studentId = studentRes.body.data.user.id;

    // Admin account
    const adminEmail = `comm_admin_${Date.now()}@example.com`;
    const adminRes = await request(app).post('/api/v1/auth/register').send({
      email: adminEmail,
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'Moderator',
    });
    adminToken = adminRes.body.data.accessToken;
    await prisma.user.update({
      where: { id: adminRes.body.data.user.id },
      data: { role: 'ADMIN' },
    });

    // Re-login admin to refresh role in JWT
    const adminLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: adminEmail,
      password: 'Password123!',
    });
    adminToken = adminLoginRes.body.data.accessToken;

    // Fetch or create a category
    const cat = await prisma.category.findFirst();
    if (cat) {
      categoryId = cat.id;
    } else {
      const newCat = await prisma.category.create({
        data: { name: 'Focus Tools', slug: 'focus-tools' },
      });
      categoryId = newCat.id;
    }
  });

  describe('Student Resource Suggestions', () => {
    it('requires authentication to suggest a resource', async () => {
      const res = await request(app)
        .post('/api/v1/community/suggestions')
        .send({ title: 'Forest' });
      expect(res.status).toBe(401);
    });

    it('allows authenticated student to suggest a digital wellness resource', async () => {
      const res = await request(app)
        .post('/api/v1/community/suggestions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Forest App',
          tagline: 'Stay focused and plant virtual trees',
          description: 'A gamified timer that plants trees while you study.',
          websiteUrl: 'https://forestapp.cc',
          pricingModel: 'FREEMIUM',
          platforms: ['IOS', 'ANDROID'],
          categoryId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Forest App');
      expect(res.body.data.status).toBe('PENDING');
      suggestionId = res.body.data.id;
    });

    it('rejects invalid resource suggestion payload (URL validation)', async () => {
      const res = await request(app)
        .post('/api/v1/community/suggestions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Invalid Tool',
          tagline: 'Invalid website link test',
          description: 'Valid description here',
          websiteUrl: 'not-a-valid-url',
          pricingModel: 'FREEMIUM',
          platforms: ['IOS'],
          categoryId,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Student Feedback & Issue Reports', () => {
    it('allows student to submit feedback with categorisation', async () => {
      const res = await request(app)
        .post('/api/v1/community/feedback')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          type: 'UI_UX_SUGGESTION',
          title: 'Dark mode contrast tweak',
          details: 'The secondary text on cards has slight contrast issues in sunlight.',
          pageUrl: 'https://wellnesshub.edu/resources',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('UI_UX_SUGGESTION');
      feedbackId = res.body.data.id;
    });

    it('allows student to report outdated or incorrect content', async () => {
      const res = await request(app)
        .post('/api/v1/community/reports')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          contentType: 'RESOURCE',
          contentId: 'res-12345',
          reason: 'Outdated pricing model',
          details: 'The pricing has changed from free to paid subscription.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      reportId = res.body.data.id;
    });

    it('lists private user submissions strictly for the owner', async () => {
      const res = await request(app)
        .get('/api/v1/community/my-submissions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.feedback.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.reports.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Admin Moderation & Resource Conversion', () => {
    it('forbids non-admin student from accessing moderation queue', async () => {
      const res = await request(app)
        .get('/api/v1/community/admin/suggestions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('allows admin to list suggestions and feedback', async () => {
      const sugRes = await request(app)
        .get('/api/v1/community/admin/suggestions')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(sugRes.status).toBe(200);
      expect(sugRes.body.data.length).toBeGreaterThanOrEqual(1);

      const feedRes = await request(app)
        .get('/api/v1/community/admin/feedback')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(feedRes.status).toBe(200);

      const repRes = await request(app)
        .get('/api/v1/community/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(repRes.status).toBe(200);
    });

    it('approves a suggestion and automatically converts it into an official resource', async () => {
      const res = await request(app)
        .patch(`/api/v1/community/admin/suggestions/${suggestionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'APPROVED',
          adminNotes: 'Great student contribution! Adding to official catalog.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPROVED');
      expect(res.body.data.convertedResourceId).toBeDefined();

      // Verify the new official resource exists
      const officialResource = await prisma.resource.findUnique({
        where: { id: res.body.data.convertedResourceId },
      });
      expect(officialResource).not.toBeNull();
      expect(officialResource?.title).toBe('Forest App');
      expect(officialResource?.isVerified).toBe(true);
      expect(officialResource?.submittedByUserId).toBe(studentId);
    });

    it('allows admin to resolve feedback and reports', async () => {
      const feedRes = await request(app)
        .patch(`/api/v1/community/admin/feedback/${feedbackId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'RESOLVED',
          adminNotes: 'Updated color token.',
        });
      expect(feedRes.status).toBe(200);
      expect(feedRes.body.data.status).toBe('RESOLVED');

      const repRes = await request(app)
        .patch(`/api/v1/community/admin/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'RESOLVED',
          adminNotes: 'Updated pricing details.',
        });
      expect(repRes.status).toBe(200);
      expect(repRes.body.data.status).toBe('RESOLVED');
    });
  });
});
