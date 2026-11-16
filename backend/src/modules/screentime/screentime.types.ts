export interface UpsertScreenTimeLogDTO {
  logDate: string; // YYYY-MM-DD
  totalMinutes: number;
  productiveMinutes?: number;
  distractingMinutes?: number;
  pickupsCount?: number;
  categoryBreakdown?: Record<string, number>;
  notes?: string;
}

export interface UpsertScreenTimeGoalDTO {
  maxDailyMinutes?: number;
  maxDistractingMinutes?: number;
  targetBedtimeHour?: number;
}

export interface ScreenTimeQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}
