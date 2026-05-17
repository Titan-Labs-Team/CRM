import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('subscriptions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('stripe_subscription_id', 255).unique();
    t.string('stripe_customer_id', 255);
    t.string('status', 50).notNullable().defaultTo('active');
    t.string('plan', 50).notNullable().defaultTo('free');
    t.timestamp('current_period_start', { useTz: true });
    t.timestamp('current_period_end', { useTz: true });
    t.timestamp('canceled_at', { useTz: true });
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('subscriptions');
}
