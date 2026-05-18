import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('integrations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.string('url', 2048).notNullable();
    t.string('secret', 255).notNullable();
    t.specificType('events', 'text[]').notNullable().defaultTo('{}');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('last_triggered_at', { useTz: true }).nullable();
    t.integer('last_response_status').nullable();
    t.text('last_response_body').nullable();
    t.timestamps(true, true);

    t.index(['tenant_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('integrations');
}
