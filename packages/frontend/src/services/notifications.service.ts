import { api } from './api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  resource_type?: string;
  resource_id?: string;
  read: boolean;
  created_at: string;
}

export const notificationsService = {
  async list(): Promise<Notification[]> {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  async unreadCount(): Promise<number> {
    const res = await api.get('/notifications/unread-count');
    return res.data.data.count;
  },

  async markRead(id: string): Promise<Notification> {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },
};
