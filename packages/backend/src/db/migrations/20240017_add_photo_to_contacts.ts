import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('contacts', (t) => {
    t.binary('photo_data').nullable();
    t.string('photo_mime', 50).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('contacts', (t) => {
    t.dropColumn('photo_data');
    t.dropColumn('photo_mime');
  });
}
