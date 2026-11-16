export type Platform = 'IOS' | 'ANDROID' | 'MACOS' | 'WINDOWS' | 'LINUX' | 'BROWSER';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface GuideStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
  warning?: string;
}

export interface DeviceGuide {
  id: string;
  title: string;
  slug: string;
  platform: Platform;
  difficulty: Difficulty;
  estimatedMinutes: number;
  steps: GuideStep[];
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GuideQueryParams {
  page?: number;
  limit?: number;
  platform?: string;
  difficulty?: string;
  search?: string;
}

export interface PaginatedGuidesResponse {
  success: boolean;
  data: DeviceGuide[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GuideDetailResponse {
  success: boolean;
  data: {
    guide: DeviceGuide;
    relatedGuides: DeviceGuide[];
  };
}
