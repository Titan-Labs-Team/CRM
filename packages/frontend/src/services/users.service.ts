import { api } from './api';

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'seller';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface InviteUserInput {
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'seller';
}

export interface UpdateUserInput {
  role?: 'admin' | 'manager' | 'seller';
  fullName?: string;
  isActive?: boolean;
}

export const usersService = {
  async list(page = 1, limit = 50): Promise<{ data: TeamMember[]; meta: { total: number } }> {
    const { data } = await api.get('/users', { params: { page, limit } });
    return data;
  },

  async invite(input: InviteUserInput): Promise<TeamMember> {
    const { data } = await api.post<{ data: TeamMember }>('/users/invite', input);
    return data.data;
  },

  async update(id: string, input: UpdateUserInput): Promise<TeamMember> {
    const { data } = await api.patch<{ data: TeamMember }>(`/users/${id}`, input);
    return data.data;
  },
};
