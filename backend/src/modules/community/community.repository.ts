import { prisma } from '../../config/prisma';
import {
  SubmissionStatus,
  FeedbackType,
  ReportContentType,
  PricingModel,
} from '@prisma/client';

export class CommunityRepository {
  // Resource Suggestions
  async createResourceSuggestion(userId: string, data: {
    title: string;
    tagline: string;
    description: string;
    websiteUrl: string;
    pricingModel: PricingModel;
    platforms: string[];
    categoryId: string;
  }) {
    return prisma.resourceSuggestion.create({
      data: {
        userId,
        ...data,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async getResourceSuggestionById(id: string) {
    return prisma.resourceSuggestion.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async listUserSuggestions(userId: string) {
    return prisma.resourceSuggestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllSuggestions(status?: SubmissionStatus) {
    return prisma.resourceSuggestion.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async updateSuggestionStatus(id: string, status: SubmissionStatus, adminNotes?: string, convertedResourceId?: string) {
    return prisma.resourceSuggestion.update({
      where: { id },
      data: {
        status,
        adminNotes,
        convertedResourceId,
      },
    });
  }

  // Feedback Submissions
  async createFeedback(userId: string, data: {
    type: FeedbackType;
    title: string;
    details: string;
    pageUrl?: string;
  }) {
    return prisma.feedbackSubmission.create({
      data: {
        userId,
        ...data,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async getFeedbackById(id: string) {
    return prisma.feedbackSubmission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async listUserFeedback(userId: string) {
    return prisma.feedbackSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllFeedback(status?: SubmissionStatus, type?: FeedbackType) {
    return prisma.feedbackSubmission.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async updateFeedbackStatus(id: string, status: SubmissionStatus, adminNotes?: string) {
    return prisma.feedbackSubmission.update({
      where: { id },
      data: {
        status,
        adminNotes,
      },
    });
  }

  // Content Reports
  async createReport(userId: string, data: {
    contentType: ReportContentType;
    contentId: string;
    reason: string;
    details?: string;
  }) {
    return prisma.contentReport.create({
      data: {
        userId,
        ...data,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async getReportById(id: string) {
    return prisma.contentReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async listUserReports(userId: string) {
    return prisma.contentReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllReports(status?: SubmissionStatus) {
    return prisma.contentReport.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async updateReportStatus(id: string, status: SubmissionStatus, adminNotes?: string) {
    return prisma.contentReport.update({
      where: { id },
      data: {
        status,
        adminNotes,
      },
    });
  }
}

export const communityRepository = new CommunityRepository();
