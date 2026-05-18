import { api } from './api';

export const SUPPORTED_EVENTS = [
  'contact.created',
  'contact.updated',
  'contact.deleted',
  'deal.created',
  'deal.updated',
  'deal.stage_changed',
  'deal.won',
  'deal.lost',
] as const;

export type WebhookEvent = (typeof SUPPORTED_EVENTS)[number];

export interface Integration {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  is_active: boolean;
  last_triggered_at: string | null;
  last_response_status: number | null;
  created_at: string;
}

export interface CreateIntegrationInput {
  name: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
}

export interface UpdateIntegrationInput {
  name?: string;
  url?: string;
  secret?: string;
  events?: WebhookEvent[];
  isActive?: boolean;
}

export const integrationsService = {
  list: () => api.get('/integrations').then((r) => r.data.data as Integration[]),
  create: (input: CreateIntegrationInput) =>
    api.post('/integrations', input).then((r) => r.data.data as Integration),
  update: (id: string, input: UpdateIntegrationInput) =>
    api.patch(`/integrations/${id}`, input).then((r) => r.data.data as Integration),
  delete: (id: string) => api.delete(`/integrations/${id}`),
  test: (id: string) =>
    api.post(`/integrations/${id}/test`).then((r) => r.data.data as {
      last_response_status: number;
      last_response_body: string;
      last_triggered_at: string;
    }),
};
