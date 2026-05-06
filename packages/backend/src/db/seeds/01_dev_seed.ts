import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  await knex('refresh_tokens').del();
  await knex('users').del();
  await knex('tenants').del();

  const [tenant] = await knex('tenants')
    .insert({
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'pro',
    })
    .returning('*');

  const passwordHash = await bcrypt.hash('password123', 12);

  await knex('users').insert([
    {
      tenant_id: tenant.id,
      email: 'admin@acme.com',
      password_hash: passwordHash,
      full_name: 'Admin User',
      role: 'admin',
    },
    {
      tenant_id: tenant.id,
      email: 'seller@acme.com',
      password_hash: passwordHash,
      full_name: 'John Seller',
      role: 'seller',
    },
  ]);
}
