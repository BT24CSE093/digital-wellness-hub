import { focusRepository } from './focus.repository';
import { CreateFocusSessionDTO, FocusSessionQueryParams } from './focus.types';

export class FocusService {
  async logSession(userId: string, data: CreateFocusSessionDTO) {
    return focusRepository.create(userId, data);
  }

  async listSessions(userId: string, params: FocusSessionQueryParams) {
    const { sessions, total } = await focusRepository.findMany(userId, params);
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    return {
      sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(userId: string) {
    return focusRepository.getStats(userId);
  }

  async getWeeklyTrend(userId: string) {
    return focusRepository.getWeeklyTrend(userId);
  }

  async deleteSession(userId: string, id: string) {
    const session = await focusRepository.findById(id, userId);
    if (!session) return null;
    await focusRepository.delete(id, userId);
    return session;
  }
}

export const focusService = new FocusService();
