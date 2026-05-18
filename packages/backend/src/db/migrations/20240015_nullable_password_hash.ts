import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.string('password_hash', 255).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Set empty string for any null rows before reverting to notNullable
  await knex('users').whereNull('password_hash').update({ password_hash: '' });
  await knex.schema.alterTable('users', (t) => {
    t.string('password_hash', 255).notNullable().alter();
  });
}
