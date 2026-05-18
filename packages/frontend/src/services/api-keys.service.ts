import { api } from './api';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes: ('read' | 'write')[];
  expiresAt?: string;
}

export interface CreatedApiKey extends ApiKey {
  key: string;
}

export const apiKeysService = {
  list: () => api.get('/api-keys').then((r) => r.data.data as ApiKey[]),
  create: (input: CreateApiKeyInput) =>
    api.post('/api-keys', input).then((r) => r.data.data as CreatedApiKey),
  revoke: (id: string) => api.delete(`/api-keys/${id}`),
};
