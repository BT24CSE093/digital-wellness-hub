import { screenTimeRepository } from './screentime.repository';
import { UpsertScreenTimeLogDTO, UpsertScreenTimeGoalDTO, ScreenTimeQueryParams } from './screentime.types';

export class ScreenTimeService {
  async upsertLog(userId: string, data: UpsertScreenTimeLogDTO) {
    return screenTimeRepository.upsertLog(userId, data);
  }

  async getLogs(userId: string, params: ScreenTimeQueryParams) {
    return screenTimeRepository.findLogs(userId, params);
  }

  async getTodayLog(userId: string) {
    return screenTimeRepository.findTodayLog(userId);
  }

  async upsertGoal(userId: string, data: UpsertScreenTimeGoalDTO) {
    return screenTimeRepository.upsertGoal(userId, data);
  }

  async getGoal(userId: string) {
    return screenTimeRepository.findGoal(userId);
  }

  async getWeeklyStats(userId: string) {
    return screenTimeRepository.getWeeklyStats(userId);
  }
}

export const screenTimeService = new ScreenTimeService();
