import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.createTable('notifications', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('type').notNullable(); // deal.won, deal.lost, deal.stage_changed, etc.
    t.string('title').notNullable();
    t.string('body');
    t.string('resource_type'); // deal | contact | activity
    t.uuid('resource_id');
    t.boolean('read').notNullable().defaultTo(false);
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.table('notifications', (t) => {
    t.index(['tenant_id', 'user_id', 'read']);
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists('notifications');
}
