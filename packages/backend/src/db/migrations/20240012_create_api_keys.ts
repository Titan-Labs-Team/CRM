import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('api_keys', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.string('prefix', 16).notNullable();
    t.string('key_hash', 64).notNullable().unique();
    t.specificType('scopes', 'text[]').notNullable().defaultTo('{read}');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('last_used_at', { useTz: true }).nullable();
    t.timestamp('expires_at', { useTz: true }).nullable();
    t.timestamps(true, true);

    t.index(['tenant_id']);
    t.index(['key_hash']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('api_keys');
}
