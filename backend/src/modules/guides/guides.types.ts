import { Platform, Difficulty } from '@prisma/client';

export interface GuideStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
  warning?: string;
}

export interface GuideQueryParams {
  page?: number;
  limit?: number;
  platform?: Platform;
  difficulty?: Difficulty;
  search?: string;
}

export interface CreateGuideDTO {
  title: string;
  slug?: string;
  platform: Platform;
  difficulty: Difficulty;
  estimatedMinutes: number;
  steps: GuideStep[];
  isPublished?: boolean;
}

export interface UpdateGuideDTO {
  title?: string;
  slug?: string;
  platform?: Platform;
  difficulty?: Difficulty;
  estimatedMinutes?: number;
  steps?: GuideStep[];
  isPublished?: boolean;
}
