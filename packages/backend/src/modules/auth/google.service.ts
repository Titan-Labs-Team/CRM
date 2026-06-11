import { db } from '../../db';
import { env } from '../../config/env';
import { SignJWT } from 'jose';
import crypto from 'crypto';

const accessSecret = new TextEncoder().encode(env.JWT_SECRET);

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
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db('refresh_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  return rawToken;
}

function generateSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40) || 'workspace';

  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}

export async function handleGoogleUser(profile: {
  id: string;
  emails?: Array<{ value: string }>;
  displayName: string;
}) {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new Error('No email from Google profile');

  // Try to find existing user by email
  const existingUser = await db('users').where({ email }).first();

  if (existingUser) {
    // Existing user — log them in
    await db('users').where({ id: existingUser.id }).update({ last_login_at: new Date() });
    const accessToken = await signAccessToken(
      existingUser.id,
      existingUser.tenant_id,
      existingUser.role,
      existingUser.email,
    );
    const refreshToken = await signRefreshToken(existingUser.id);
    const { password_hash, ...safeUser } = existingUser;
    void password_hash;
    return { accessToken, refreshToken, user: safeUser, isNew: false };
  }

  // New user — create tenant + admin user
  const workspaceName = profile.displayName || email.split('@')[0];
  const slug = generateSlug(workspaceName);

  const [tenant] = await db('tenants')
    .insert({ name: workspaceName, slug })
    .returning('*');

  const [user] = await db('users')
    .insert({
      tenant_id: tenant.id,
      email,
      password_hash: null,
      full_name: profile.displayName || email,
      role: 'admin',
    })
    .returning('*');

  await db('user_tenants')
    .insert({ user_id: user.id, tenant_id: tenant.id, role: user.role })
    .onConflict(['user_id', 'tenant_id'])
    .ignore();

  const accessToken = await signAccessToken(user.id, tenant.id, user.role, user.email);
  const refreshToken = await signRefreshToken(user.id);
  const { password_hash, ...safeUser } = user;
  void password_hash;
  return { accessToken, refreshToken, user: safeUser, isNew: true };
}
