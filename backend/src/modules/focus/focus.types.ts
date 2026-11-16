import { SessionType } from '@prisma/client';

export interface CreateFocusSessionDTO {
  sessionType?: SessionType;
  durationMinutes: number;
  intention?: string;
  reflection?: string;
  distractionsCount?: number;
  focusRating?: number;
}

export interface FocusSessionQueryParams {
  page?: number;
  limit?: number;
  sessionType?: SessionType;
  startDate?: string;
  endDate?: string;
}

export interface FocusStats {
  totalSessions: number;
  totalMinutes: number;
  todayMinutes: number;
  weekMinutes: number;
  avgFocusRating: number | null;
  avgDistractions: number;
}
