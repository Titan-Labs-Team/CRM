import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('pipelines', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.boolean('is_default').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('pipeline_stages', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('pipeline_id').notNullable().references('id').inTable('pipelines').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.integer('position').notNullable().defaultTo(0);
    t.string('color', 7).defaultTo('#72d296');
    t.integer('probability').notNullable().defaultTo(0);
    t.timestamps(true, true);

    t.index(['pipeline_id', 'position']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('pipeline_stages');
  await knex.schema.dropTableIfExists('pipelines');
}
