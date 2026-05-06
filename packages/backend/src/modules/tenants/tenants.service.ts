import { db } from '../../db';
import { z } from 'zod';

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(255).optional(),
});

export async function getTenant(tenantId: string) {
  const tenant = await db('tenants').where({ id: tenantId }).first();
  if (!tenant) throw Object.assign(new Error('Tenant not found'), { status: 404 });
  return tenant;
}

export async function updateTenant(tenantId: string, input: z.infer<typeof updateTenantSchema>) {
  const [tenant] = await db('tenants')
    .where({ id: tenantId })
    .update({ ...input, updated_at: new Date() })
    .returning('*');
  return tenant;
}
