import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('tenants', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 255).notNullable();
    t.string('slug', 100).notNullable().unique();
    t.string('plan', 50).notNullable().defaultTo('free');
    t.timestamp('plan_expires_at', { useTz: true });
    t.string('stripe_customer_id', 255);
    t.integer('max_users').notNullable().defaultTo(3);
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tenants');
}
