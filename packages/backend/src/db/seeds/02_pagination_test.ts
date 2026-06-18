import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const tenant = await knex('tenants').select('id').first();
  if (!tenant) {
    console.log('⚠️  Nenhum tenant encontrado — crie uma conta primeiro e rode o seed novamente.');
    return;
  }

  const existing = await knex('deals').where({ tenant_id: tenant.id }).count('id as count').first();
  if (Number(existing?.count) > 0) {
    console.log(`ℹ️  Já existem deals — pulando inserção de dados de teste.`);
    return;
  }

  const pipeline = await knex('pipelines').where({ tenant_id: tenant.id }).select('id').first();
  if (!pipeline) {
    console.log('⚠️  Nenhum pipeline encontrado — complete o onboarding primeiro.');
    return;
  }

  const stage = await knex('pipeline_stages')
    .where({ pipeline_id: pipeline.id })
    .orderBy('position', 'asc')
    .select('id')
    .first();
  if (!stage) {
    console.log('⚠️  Nenhuma etapa encontrada no pipeline.');
    return;
  }

  const contact = await knex('contacts').where({ tenant_id: tenant.id }).select('id').first();
  const statuses = ['open', 'open', 'open', 'won', 'lost'] as const;
  const empresas = ['Empresa Alpha', 'Beta Tecnologia', 'Gamma Soluções', 'Delta Corp', 'Épsilon Ltda'];

  const deals = Array.from({ length: 45 }, (_, i) => ({
    id: knex.raw('gen_random_uuid()'),
    tenant_id: tenant.id,
    pipeline_id: pipeline.id,
    stage_id: stage.id,
    title: `Negócio de teste #${String(i + 1).padStart(2, '0')} — ${empresas[i % empresas.length]}`,
    value: (i + 1) * 1500,
    status: statuses[i % statuses.length],
    contact_id: contact?.id ?? null,
    position: i,
    created_at: new Date(Date.now() - i * 3_600_000).toISOString(),
    updated_at: new Date().toISOString(),
  }));

  await knex('deals').insert(deals);
  console.log(`✅ 45 deals de teste inseridos. Acesse /deals para testar paginação.`);
}
