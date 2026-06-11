import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_tenants', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('role', 50).notNullable().defaultTo('seller');
    t.timestamps(true, true);

    t.unique(['user_id', 'tenant_id']);
  });

  // Migrate existing user-tenant relationships into the pivot table
  await knex.raw(`
    INSERT INTO user_tenants (user_id, tenant_id, role, created_at, updated_at)
    SELECT id, tenant_id, role, created_at, updated_at
    FROM users
    ON CONFLICT (user_id, tenant_id) DO NOTHING
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_tenants');
}
