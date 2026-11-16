import { communityRepository } from './community.repository';
import { resourcesRepository } from '../resources/resources.repository';
import { AppError } from '../../middleware/errorHandler';
import {
  SubmissionStatus,
  FeedbackType,
  ReportContentType,
  PricingModel,
} from '@prisma/client';

export class CommunityService {
  // Resource Suggestions
  async suggestResource(userId: string, data: {
    title: string;
    tagline: string;
    description: string;
    websiteUrl: string;
    pricingModel: PricingModel;
    platforms: string[];
    categoryId: string;
  }) {
    return communityRepository.createResourceSuggestion(userId, data);
  }

  async getMySuggestions(userId: string) {
    return communityRepository.listUserSuggestions(userId);
  }

  async listAllSuggestions(status?: SubmissionStatus) {
    return communityRepository.listAllSuggestions(status);
  }

  async moderateSuggestion(
    id: string,
    status: SubmissionStatus,
    adminNotes?: string,
    adminUserId?: string
  ) {
    const suggestion = await communityRepository.getResourceSuggestionById(id);
    if (!suggestion) {
      throw new AppError('Resource suggestion not found', 404);
    }

    let convertedResourceId: string | undefined = undefined;

    // If approving, convert suggestion to official Resource
    if (status === SubmissionStatus.APPROVED && !suggestion.convertedResourceId) {
      const baseSlug = suggestion.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const newResource = await resourcesRepository.create({
        title: suggestion.title,
        slug,
        tagline: suggestion.tagline,
        description: suggestion.description,
        websiteUrl: suggestion.websiteUrl,
        pricingModel: suggestion.pricingModel,
        platforms: suggestion.platforms,
        categoryId: suggestion.categoryId,
        isVerified: true,
        submittedByUserId: suggestion.userId,
        verifiedByUserId: adminUserId,
      });
      convertedResourceId = newResource.id;
    }

    return communityRepository.updateSuggestionStatus(id, status, adminNotes, convertedResourceId);
  }

  // Feedback
  async submitFeedback(userId: string, data: {
    type: FeedbackType;
    title: string;
    details: string;
    pageUrl?: string;
  }) {
    return communityRepository.createFeedback(userId, data);
  }

  async getMyFeedback(userId: string) {
    return communityRepository.listUserFeedback(userId);
  }

  async listAllFeedback(status?: SubmissionStatus, type?: FeedbackType) {
    return communityRepository.listAllFeedback(status, type);
  }

  async moderateFeedback(id: string, status: SubmissionStatus, adminNotes?: string) {
    const feedback = await communityRepository.getFeedbackById(id);
    if (!feedback) {
      throw new AppError('Feedback submission not found', 404);
    }
    return communityRepository.updateFeedbackStatus(id, status, adminNotes);
  }

  // Reports
  async submitReport(userId: string, data: {
    contentType: ReportContentType;
    contentId: string;
    reason: string;
    details?: string;
  }) {
    return communityRepository.createReport(userId, data);
  }

  async getMyReports(userId: string) {
    return communityRepository.listUserReports(userId);
  }

  async listAllReports(status?: SubmissionStatus) {
    return communityRepository.listAllReports(status);
  }

  async moderateReport(id: string, status: SubmissionStatus, adminNotes?: string) {
    const report = await communityRepository.getReportById(id);
    if (!report) {
      throw new AppError('Content report not found', 404);
    }
    return communityRepository.updateReportStatus(id, status, adminNotes);
  }

  async getMySubmissionsSummary(userId: string) {
    const [suggestions, feedback, reports] = await Promise.all([
      communityRepository.listUserSuggestions(userId),
      communityRepository.listUserFeedback(userId),
      communityRepository.listUserReports(userId),
    ]);
    return {
      suggestions,
      feedback,
      reports,
      totalCount: suggestions.length + feedback.length + reports.length,
    };
  }
}

export const communityService = new CommunityService();
