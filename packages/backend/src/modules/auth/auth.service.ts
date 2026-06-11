import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import { db } from '../../db';
import { env } from '../../config/env';
import type { RegisterInput, LoginInput, UpdateMeInput } from './auth.schema';

const accessSecret = new TextEncoder().encode(env.JWT_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function signAccessToken(userId: string, tenantId: string, role: string, email: string) {
  return new SignJWT({ tenantId, role, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret);
}

async function signRefreshToken(userId: string) {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db('refresh_tokens').insert({
    user_id: userId,
    token_hash: hashToken(rawToken),
    expires_at: expiresAt,
  });

  return rawToken;
}

export async function register(input: RegisterInput) {
  const existingSlug = await db('tenants').where({ slug: input.slug }).first();
  if (existingSlug) throw Object.assign(new Error('Slug already taken'), { status: 409 });

  const passwordHash = await bcrypt.hash(input.password, 12);

  const [tenant] = await db('tenants')
    .insert({ name: input.workspaceName, slug: input.slug })
    .returning('*');

  const [user] = await db('users')
    .insert({
      tenant_id: tenant.id,
      email: input.email,
      password_hash: passwordHash,
      full_name: input.fullName,
      role: 'admin',
    })
    .returning('*');

  await db('user_tenants')
    .insert({ user_id: user.id, tenant_id: tenant.id, role: user.role })
    .onConflict(['user_id', 'tenant_id'])
    .ignore();

  const accessToken = await signAccessToken(user.id, tenant.id, user.role, user.email);
  const refreshToken = await signRefreshToken(user.id);

  return { accessToken, refreshToken, user: sanitizeUser(user), tenant };
}

export async function login(input: LoginInput) {
  const user = await db('users').where({ email: input.email, is_active: true }).first();
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  await db('users').where({ id: user.id }).update({ last_login_at: new Date() });

  const accessToken = await signAccessToken(user.id, user.tenant_id, user.role, user.email);
  const refreshToken = await signRefreshToken(user.id);

  return { accessToken, refreshToken, user: sanitizeUser(user) };
}

export async function refresh(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const stored = await db('refresh_tokens')
    .where({ token_hash: tokenHash })
    .andWhere('expires_at', '>', new Date())
    .first();

  if (!stored) throw Object.assign(new Error('Invalid or expired refresh token'), { status: 401 });

  await db('refresh_tokens').where({ id: stored.id }).delete();

  const user = await db('users').where({ id: stored.user_id, is_active: true }).first();
  if (!user) throw Object.assign(new Error('User not found'), { status: 401 });

  const accessToken = await signAccessToken(user.id, user.tenant_id, user.role, user.email);
  const newRefreshToken = await signRefreshToken(user.id);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  await db('refresh_tokens').where({ token_hash: tokenHash }).delete();
}

export async function getMe(userId: string) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return sanitizeUser(user);
}

export async function updateMe(userId: string, input: UpdateMeInput) {
  const updates: Record<string, unknown> = { updated_at: new Date() };
  if (input.fullName) updates.full_name = input.fullName;
  if (input.password) {
    updates.password_hash = await bcrypt.hash(input.password, 12);
    updates.must_change_password = false;
  }

  const [user] = await db('users').where({ id: userId }).update(updates).returning('*');
  return sanitizeUser(user);
}

export async function listWorkspaces(userId: string) {
  return db('user_tenants as ut')
    .join('tenants as t', 'ut.tenant_id', 't.id')
    .where('ut.user_id', userId)
    .orderBy('t.name', 'asc')
    .select('t.id', 't.name', 't.slug', 't.plan', 'ut.role');
}

export async function switchWorkspace(userId: string, tenantId: string) {
  const membership = await db('user_tenants')
    .where({ user_id: userId, tenant_id: tenantId })
    .first();

  if (!membership) throw Object.assign(new Error('No access to this workspace'), { status: 403 });

  const user = await db('users').where({ id: userId, is_active: true }).first();
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const accessToken = await signAccessToken(userId, tenantId, membership.role, user.email);
  const refreshToken = await signRefreshToken(userId);

  const tenant = await db('tenants').where({ id: tenantId }).first();

  return { accessToken, refreshToken, tenantId, tenantName: tenant.name };
}

function sanitizeUser(user: Record<string, unknown>) {
  const { password_hash, ...safe } = user;
  void password_hash;
  return safe;
}
