import { api } from './api';

export interface Contact {
  id: string;
  type: 'lead' | 'contact' | 'client';
  full_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  source?: string;
  tags: string[];
  owner_id?: string;
  owner_name?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactInput {
  type?: 'lead' | 'contact' | 'client';
  fullName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  source?: string;
  tags?: string[];
  ownerId?: string;
}

export interface ContactsListParams {
  type?: string;
  owner?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const contactsService = {
  list: (params?: ContactsListParams) =>
    api.get('/contacts', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/contacts/${id}`).then((r) => r.data.data as Contact),
  create: (input: CreateContactInput) =>
    api.post('/contacts', input).then((r) => r.data.data as Contact),
  update: (id: string, input: Partial<CreateContactInput>) =>
    api.patch(`/contacts/${id}`, input).then((r) => r.data.data as Contact),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  exportCsv: () =>
    api.get('/contacts/export', { responseType: 'blob' }).then((r) => r.data as Blob),
  importCsv: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ data: { imported: number; skipped: number; errors: string[] } }>(
      '/contacts/import', form, { headers: { 'Content-Type': 'multipart/form-data' } },
    ).then((r) => r.data.data);
  },
};
