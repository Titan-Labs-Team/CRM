import { db } from '../../db';
import { z } from 'zod';
import { getPaginationParams, paginatedResponse } from '../../shared/utils/paginate';

export const updateUserSchema = z.object({
  role: z.enum(['admin', 'manager', 'seller']).optional(),
  fullName: z.string().min(2).max(255).optional(),
  isActive: z.boolean().optional(),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(255),
  role: z.enum(['admin', 'manager', 'seller']).default('seller'),
});

export async function listUsers(tenantId: string, query: Record<string, unknown>) {
  const { page, limit, offset } = getPaginationParams(query);

  const base = db('users').where({ tenant_id: tenantId });
  const [{ count }] = await base.clone().count('id as count');
  const users = await base
    .clone()
    .select('id', 'email', 'full_name', 'role', 'is_active', 'last_login_at', 'created_at')
    .orderBy('created_at', 'asc')
    .limit(limit)
    .offset(offset);

  return paginatedResponse(users, Number(count), page, limit);
}

export async function inviteUser(tenantId: string, input: z.infer<typeof inviteUserSchema>) {
  const existing = await db('users').where({ tenant_id: tenantId, email: input.email }).first();
  if (existing) throw Object.assign(new Error('User with this email already exists'), { status: 409 });

  const tempPassword = Math.random().toString(36).slice(-12);
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const [user] = await db('users')
    .insert({
      tenant_id: tenantId,
      email: input.email,
      full_name: input.fullName,
      role: input.role,
      password_hash: passwordHash,
    })
    .returning(['id', 'email', 'full_name', 'role', 'created_at']);

  return user;
}

export async function updateUser(
  tenantId: string,
  userId: string,
  input: z.infer<typeof updateUserSchema>,
) {
  const updates: Record<string, unknown> = { updated_at: new Date() };
  if (input.role !== undefined) updates.role = input.role;
  if (input.fullName !== undefined) updates.full_name = input.fullName;
  if (input.isActive !== undefined) updates.is_active = input.isActive;

  const [user] = await db('users')
    .where({ id: userId, tenant_id: tenantId })
    .update(updates)
    .returning(['id', 'email', 'full_name', 'role', 'is_active', 'updated_at']);

  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return user;
}
