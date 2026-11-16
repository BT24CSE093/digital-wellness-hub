export type PricingModel = 'FREE' | 'FREEMIUM' | 'PAID' | 'OPEN_SOURCE';

export type Platform = 'IOS' | 'ANDROID' | 'MACOS' | 'WINDOWS' | 'LINUX' | 'BROWSER';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count?: {
    resources: number;
  };
}

export interface ResourceReview {
  id: string;
  rating: number;
  reviewText?: string | null;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Resource {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  pricingModel: PricingModel;
  platforms: string[];
  categoryId: string;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  submittedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  verifiedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  reviews?: ResourceReview[];
  _count?: {
    reviews: number;
  };
}

export interface ResourceFilterState {
  search?: string;
  category?: string;
  platform?: string;
  pricingModel?: string;
  isVerified?: boolean;
  sortBy?: 'ratingAvg' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResourcesResponse {
  success: boolean;
  data: Resource[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
