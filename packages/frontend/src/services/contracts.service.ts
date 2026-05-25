import { api } from './api';

export interface Contract {
  id: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export const contractsService = {
  list: (contactId: string) =>
    api.get(`/contacts/${contactId}/contracts`).then((r) => r.data.data as Contract[]),

  upload: (contactId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ data: Contract }>(
      `/contacts/${contactId}/contracts`,
      form,
      { headers: { 'Content-Type': undefined } },
    ).then((r) => r.data.data);
  },

  downloadUrl: (contactId: string, contractId: string) =>
    `${api.defaults.baseURL}/contacts/${contactId}/contracts/${contractId}/download`,

  delete: (contactId: string, contractId: string) =>
    api.delete(`/contacts/${contactId}/contracts/${contractId}`),
};
