import { plannerRepository } from './planner.repository';
import { UpsertPlannerDTO, UpdatePlannerDTO } from './planner.types';

export class PlannerService {
  async upsertPlan(userId: string, data: UpsertPlannerDTO) {
    return plannerRepository.upsert(userId, data);
  }

  async getPlanByDate(userId: string, dateStr: string) {
    return plannerRepository.findByDate(userId, dateStr);
  }

  async getRecentPlans(userId: string) {
    return plannerRepository.findRecent(userId);
  }

  async updatePlan(userId: string, dateStr: string, data: UpdatePlannerDTO) {
    return plannerRepository.update(userId, dateStr, data);
  }
}

export const plannerService = new PlannerService();
