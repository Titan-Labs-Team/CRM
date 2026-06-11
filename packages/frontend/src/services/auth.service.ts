import { api } from './api';

export interface RegisterInput {
  workspaceName: string;
  slug: string;
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
}

export const authService = {
  register: (input: RegisterInput) => api.post('/auth/register', input).then((r) => r.data.data),
  login: (input: LoginInput) => api.post('/auth/login', input).then((r) => r.data.data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data.data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me').then((r) => r.data.data),
  updateMe: (input: { fullName?: string; password?: string }) =>
    api.patch('/auth/me', input).then((r) => r.data.data),
  listWorkspaces: (): Promise<Workspace[]> =>
    api.get('/auth/workspaces').then((r) => r.data.data),
  switchWorkspace: (tenantId: string) =>
    api.post('/auth/switch-workspace', { tenantId }).then((r) => r.data.data),
};
