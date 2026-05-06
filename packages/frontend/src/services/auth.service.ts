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

export const authService = {
  register: (input: RegisterInput) => api.post('/auth/register', input).then((r) => r.data.data),
  login: (input: LoginInput) => api.post('/auth/login', input).then((r) => r.data.data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data.data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me').then((r) => r.data.data),
};
