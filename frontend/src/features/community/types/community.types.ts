export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
export type FeedbackType =
  | 'BUG_REPORT'
  | 'UI_UX_SUGGESTION'
  | 'CONTENT_CORRECTION'
  | 'ACCESSIBILITY_ISSUE'
  | 'GENERAL_FEEDBACK';
export type ReportContentType = 'RESOURCE' | 'GUIDE';

export interface ResourceSuggestion {
  id: string;
  userId: string;
  title: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  pricingModel: string;
  platforms: string[];
  categoryId: string;
  status: SubmissionStatus;
  adminNotes?: string | null;
  convertedResourceId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface FeedbackSubmission {
  id: string;
  userId: string;
  type: FeedbackType;
  title: string;
  details: string;
  pageUrl?: string | null;
  status: SubmissionStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ContentReport {
  id: string;
  userId: string;
  contentType: ReportContentType;
  contentId: string;
  reason: string;
  details?: string | null;
  status: SubmissionStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UserSubmissionsSummary {
  suggestions: ResourceSuggestion[];
  feedback: FeedbackSubmission[];
  reports: ContentReport[];
  totalCount: number;
}
