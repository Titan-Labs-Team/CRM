import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('calendar_events', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('deal_id').references('id').inTable('deals').onDelete('SET NULL');
    t.uuid('contact_id').references('id').inTable('contacts').onDelete('SET NULL');
    t.string('title', 255).notNullable();
    t.text('description');
    t.timestamp('start_at', { useTz: true }).notNullable();
    t.timestamp('end_at', { useTz: true }).notNullable();
    t.boolean('all_day').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  await knex.schema.table('calendar_events', (t) => {
    t.index(['tenant_id', 'start_at']);
  });

  await knex.schema.createTable('calendar_event_attendees', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('event_id').notNullable().references('id').inTable('calendar_events').onDelete('CASCADE');
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('status', 20).notNullable().defaultTo('pending'); // accepted | declined | pending
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    t.unique(['event_id', 'user_id']);
    t.index(['event_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('calendar_event_attendees');
  await knex.schema.dropTableIfExists('calendar_events');
}
