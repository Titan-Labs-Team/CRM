import { db } from '../../db';
import { z } from 'zod';
import { getPaginationParams, paginatedResponse } from '../../shared/utils/paginate';
import { env } from '../../config/env';

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
      must_change_password: true,
    })
    .returning(['id', 'email', 'full_name', 'role', 'created_at']);

  if (env.RESEND_API_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Titan Labs CRM <onboarding@resend.dev>',
      to: input.email,
      subject: 'Você foi convidado para o Titan Labs CRM',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#72d296;margin-bottom:8px">Bem-vindo ao Titan Labs CRM</h2>
          <p style="color:#374151">Olá, <strong>${input.fullName}</strong>!</p>
          <p style="color:#374151">Você foi convidado para acessar o CRM. Use as credenciais abaixo para entrar:</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px;color:#6b7280;font-size:13px">E-mail</p>
            <p style="margin:0 0 16px;font-weight:600;color:#111827">${input.email}</p>
            <p style="margin:0 0 8px;color:#6b7280;font-size:13px">Senha temporária</p>
            <p style="margin:0;font-weight:600;color:#111827;letter-spacing:2px">${tempPassword}</p>
          </div>
          <a href="${env.FRONTEND_URL}/login" style="display:inline-block;background:#72d296;color:#0c0f15;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Acessar CRM
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">Recomendamos trocar sua senha após o primeiro acesso.</p>
        </div>
      `,
    });
  }

  return { ...user, tempPassword: env.RESEND_API_KEY ? undefined : tempPassword };
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
