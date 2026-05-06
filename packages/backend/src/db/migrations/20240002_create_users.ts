import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('email', 255).notNullable();
    t.string('password_hash', 255).notNullable();
    t.string('full_name', 255).notNullable();
    t.string('avatar_url', 500);
    t.string('role', 50).notNullable().defaultTo('seller');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('last_login_at', { useTz: true });
    t.timestamps(true, true);

    t.unique(['tenant_id', 'email']);
  });

  await knex.schema.table('users', (t) => {
    t.index(['tenant_id', 'role']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
