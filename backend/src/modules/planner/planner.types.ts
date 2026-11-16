export interface PriorityTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface UpsertPlannerDTO {
  planDate: string; // YYYY-MM-DD
  digitalIntention: string;
  priorityTasks?: PriorityTask[];
}

export interface UpdatePlannerDTO {
  digitalIntention?: string;
  priorityTasks?: PriorityTask[];
  shutdownCompleted?: boolean;
}
