import crypto from 'crypto';
import { db } from '../../db';
import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  scopes: z.array(z.enum(['read', 'write'])).min(1).default(['read']),
  expiresAt: z.string().datetime().optional(),
});

function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

function generateKey(): { raw: string; prefix: string } {
  const random = crypto.randomBytes(24).toString('hex');
  const raw = `tlk_${random}`;
  const prefix = raw.slice(0, 12);
  return { raw, prefix };
}

export async function listApiKeys(tenantId: string) {
  return db('api_keys')
    .where({ tenant_id: tenantId, is_active: true })
    .select('id', 'name', 'prefix', 'scopes', 'last_used_at', 'expires_at', 'created_at')
    .orderBy('created_at', 'desc');
}

export async function createApiKey(tenantId: string, input: z.infer<typeof createApiKeySchema>) {
  const { raw, prefix } = generateKey();
  const keyHash = hashKey(raw);

  const [row] = await db('api_keys')
    .insert({
      tenant_id: tenantId,
      name: input.name,
      prefix,
      key_hash: keyHash,
      scopes: input.scopes,
      expires_at: input.expiresAt ?? null,
    })
    .returning(['id', 'name', 'prefix', 'scopes', 'expires_at', 'created_at']);

  return { ...row, key: raw };
}

export async function revokeApiKey(tenantId: string, keyId: string) {
  const count = await db('api_keys')
    .where({ id: keyId, tenant_id: tenantId })
    .update({ is_active: false, updated_at: new Date() });

  if (count === 0) throw Object.assign(new Error('API key not found'), { status: 404 });
}

export async function authenticateApiKey(
  rawKey: string,
): Promise<{ tenantId: string; scopes: string[] } | null> {
  const keyHash = hashKey(rawKey);

  const row = await db('api_keys')
    .where({ key_hash: keyHash, is_active: true })
    .first('id', 'tenant_id', 'scopes', 'expires_at');

  if (!row) return null;

  if (row.expires_at && new Date(row.expires_at) < new Date()) return null;

  await db('api_keys').where({ id: row.id }).update({ last_used_at: new Date() });

  return { tenantId: row.tenant_id as string, scopes: row.scopes as string[] };
}
