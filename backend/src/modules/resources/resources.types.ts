import { PricingModel } from '@prisma/client';

export interface ResourceQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  pricingModel?: PricingModel;
  platform?: string;
  isVerified?: boolean;
  search?: string;
  sortBy?: 'ratingAvg' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateResourceDTO {
  title: string;
  slug?: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  pricingModel: PricingModel;
  platforms: string[];
  categoryId: string;
  isVerified?: boolean;
}

export interface UpdateResourceDTO {
  title?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  pricingModel?: PricingModel;
  platforms?: string[];
  categoryId?: string;
  isVerified?: boolean;
}

export interface CreateCategoryDTO {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
}
