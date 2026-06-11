import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('activities', (t) => {
    t.uuid('assignee_id').nullable().references('id').inTable('users').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('activities', (t) => {
    t.dropColumn('assignee_id');
  });
}
