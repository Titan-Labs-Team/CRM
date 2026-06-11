import { api } from './api';

export interface Activity {
  id: string;
  tenant_id: string;
  deal_id: string | null;
  contact_id: string | null;
  user_id: string;
  assignee_id: string | null;
  type: 'note' | 'call' | 'email' | 'meeting' | 'task';
  title: string;
  body: string | null;
  is_done: boolean;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  assignee_name: string | null;
  contact_name: string | null;
  deal_title: string | null;
}

export interface CreateActivityInput {
  dealId?: string;
  contactId?: string;
  assigneeId?: string;
  type: Activity['type'];
  title: string;
  body?: string;
  dueAt?: string;
}

export interface ListActivitiesQuery {
  dealId?: string;
  contactId?: string;
  type?: Activity['type'];
  isDone?: boolean;
  page?: number;
  limit?: number;
}

export interface ActivitiesResponse {
  data: Activity[];
  meta: { total: number; page: number; limit: number };
}

export const activitiesService = {
  async list(query?: ListActivitiesQuery): Promise<ActivitiesResponse> {
    const { data } = await api.get<ActivitiesResponse>('/activities', { params: query });
    return data;
  },

  async create(input: CreateActivityInput): Promise<Activity> {
    const { data } = await api.post<{ data: Activity }>('/activities', input);
    return data.data;
  },

  async update(id: string, input: Partial<CreateActivityInput>): Promise<Activity> {
    const { data } = await api.patch<{ data: Activity }>(`/activities/${id}`, input);
    return data.data;
  },

  async markDone(id: string): Promise<Activity> {
    const { data } = await api.patch<{ data: Activity }>(`/activities/${id}/done`);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/activities/${id}`);
  },
};
