import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('notifications').del();
  await knex('calendar_event_attendees').del();
  await knex('calendar_events').del();
  await knex('activities').del();
  await knex('audit_logs').del();
  await knex('deals').del();
  await knex('pipeline_stages').del();
  await knex('pipelines').del();
  await knex('contacts').del();
  await knex('integrations').del();
  await knex('api_keys').del();
  await knex('subscriptions').del();
  await knex('refresh_tokens').del();
  await knex('users').del();
  await knex('tenants').del();

  console.log('✅ Banco limpo — pronto para dados reais.');
}
