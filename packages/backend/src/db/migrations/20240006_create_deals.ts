import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('deals', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('pipeline_id').notNullable().references('id').inTable('pipelines').onDelete('CASCADE');
    t.uuid('stage_id').notNullable().references('id').inTable('pipeline_stages');
    t.uuid('contact_id').references('id').inTable('contacts').onDelete('SET NULL');
    t.uuid('owner_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('title', 255).notNullable();
    t.decimal('value', 14, 2).notNullable().defaultTo(0);
    t.string('currency', 3).notNullable().defaultTo('BRL');
    t.string('status', 50).notNullable().defaultTo('open'); // open | won | lost
    t.date('expected_close');
    t.timestamp('closed_at', { useTz: true });
    t.text('lost_reason');
    t.jsonb('custom_fields').notNullable().defaultTo('{}');
    t.integer('position').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

  await knex.schema.table('deals', (t) => {
    t.index(['tenant_id', 'stage_id']);
    t.index(['tenant_id', 'owner_id']);
    t.index(['tenant_id', 'status']);
  });

  await knex.schema.createTable('audit_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('action', 100).notNullable();
    t.string('resource_type', 50);
    t.uuid('resource_id');
    t.jsonb('payload');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    t.index(['tenant_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('deals');
}
