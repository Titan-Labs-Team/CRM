import { db } from '../../db';

export interface CreateNotificationInput {
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  resourceType?: string;
  resourceId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const [notification] = await db('notifications')
    .insert({
      tenant_id: input.tenantId,
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body || null,
      resource_type: input.resourceType || null,
      resource_id: input.resourceId || null,
    })
    .returning('*');
  return notification;
}

export async function notifyTenantUsers(
  tenantId: string,
  exceptUserId: string,
  type: string,
  title: string,
  body?: string,
  resourceType?: string,
  resourceId?: string,
) {
  const users = await db('users')
    .where({ tenant_id: tenantId, is_active: true })
    .whereNot('id', exceptUserId)
    .select('id');

  if (users.length === 0) return;

  await db('notifications').insert(
    users.map((u) => ({
      tenant_id: tenantId,
      user_id: u.id,
      type,
      title,
      body: body || null,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
    })),
  );
}

export async function listNotifications(tenantId: string, userId: string) {
  return db('notifications')
    .where({ tenant_id: tenantId, user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(50);
}

export async function markRead(tenantId: string, userId: string, id: string) {
  const [n] = await db('notifications')
    .where({ id, tenant_id: tenantId, user_id: userId })
    .update({ read: true })
    .returning('*');
  if (!n) throw Object.assign(new Error('Notification not found'), { status: 404 });
  return n;
}

export async function markAllRead(tenantId: string, userId: string) {
  await db('notifications')
    .where({ tenant_id: tenantId, user_id: userId, read: false })
    .update({ read: true });
}

export async function getUnreadCount(tenantId: string, userId: string): Promise<number> {
  const [{ count }] = await db('notifications')
    .where({ tenant_id: tenantId, user_id: userId, read: false })
    .count('id as count');
  return Number(count);
}
