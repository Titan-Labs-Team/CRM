import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('activities', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('deal_id').references('id').inTable('deals').onDelete('CASCADE');
    t.uuid('contact_id').references('id').inTable('contacts').onDelete('SET NULL');
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('type', 50).notNullable(); // note | call | email | meeting | task
    t.string('title', 255).notNullable();
    t.text('body');
    t.boolean('is_done').notNullable().defaultTo(false);
    t.timestamp('due_at', { useTz: true });
    t.timestamps(true, true);
  });

  await knex.schema.table('activities', (t) => {
    t.index(['tenant_id', 'deal_id']);
    t.index(['tenant_id', 'contact_id']);
    t.index(['tenant_id', 'user_id']);
    t.index(['tenant_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('activities');
}
