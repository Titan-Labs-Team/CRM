import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('contacts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('owner_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('type', 50).notNullable().defaultTo('lead'); // lead | contact | client
    t.string('full_name', 255).notNullable();
    t.string('email', 255);
    t.string('phone', 50);
    t.string('company_name', 255);
    t.string('job_title', 255);
    t.string('source', 100);
    t.specificType('tags', 'text[]').defaultTo('{}');
    t.jsonb('custom_fields').notNullable().defaultTo('{}');
    t.timestamps(true, true);
  });

  await knex.schema.table('contacts', (t) => {
    t.index(['tenant_id', 'owner_id']);
    t.index(['tenant_id', 'type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contacts');
}
