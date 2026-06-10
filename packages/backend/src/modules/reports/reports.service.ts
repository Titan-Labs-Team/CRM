import { db } from '../../db';

export async function getActivitiesReport(
  tenantId: string,
  filters: { userId?: string; from?: string; to?: string } = {},
) {
  let base = db('activities as a')
    .leftJoin('users as u', 'a.owner_id', 'u.id')
    .where('a.tenant_id', tenantId);

  if (filters.userId) base = base.where('a.owner_id', filters.userId);
  if (filters.from) base = base.where('a.created_at', '>=', new Date(filters.from));
  if (filters.to) base = base.where('a.created_at', '<=', new Date(filters.to));

  const byType = await base.clone()
    .groupBy('a.type')
    .select('a.type')
    .count('a.id as total')
    .select(db.raw("SUM(CASE WHEN a.is_done THEN 1 ELSE 0 END) as done"));

  const byUser = await base.clone()
    .groupBy('a.owner_id', 'u.full_name')
    .select('a.owner_id', db.raw("u.full_name as owner_name"))
    .count('a.id as total')
    .select(db.raw("SUM(CASE WHEN a.is_done THEN 1 ELSE 0 END) as done"));

  return {
    byType: byType.map((r) => ({
      type: r.type as string,
      total: Number(r.total),
      done: Number(r.done),
    })),
    byUser: byUser.map((r) => ({
      userId: r.owner_id as string,
      name: (r.owner_name as string) ?? 'Sem responsável',
      total: Number(r.total),
      done: Number(r.done),
    })),
  };
}

export async function getLeaderboard(
  tenantId: string,
  filters: { pipelineId?: string; from?: string; to?: string } = {},
) {
  let base = db('deals as d')
    .join('users as u', 'd.owner_id', 'u.id')
    .where({ 'd.tenant_id': tenantId, 'd.status': 'won' })
    .whereNotNull('d.owner_id');

  if (filters.pipelineId) base = base.where('d.pipeline_id', filters.pipelineId);
  if (filters.from) base = base.where('d.closed_at', '>=', new Date(filters.from));
  if (filters.to) base = base.where('d.closed_at', '<=', new Date(filters.to));

  const rows = await base
    .groupBy('d.owner_id', 'u.full_name')
    .select('d.owner_id', db.raw("u.full_name as owner_name"))
    .count('d.id as deals_won')
    .sum('d.value as total_value')
    .orderBy('total_value', 'desc');

  return rows.map((r, idx) => ({
    rank: idx + 1,
    userId: r.owner_id as string,
    name: r.owner_name as string,
    dealsWon: Number(r.deals_won),
    totalValue: Number(r.total_value ?? 0),
  }));
}

export async function getKpis(tenantId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [{ count: openDeals }] = await db('deals')
    .where({ tenant_id: tenantId, status: 'open' })
    .count('id as count');

  const [{ count: wonMtd }] = await db('deals')
    .where({ tenant_id: tenantId, status: 'won' })
    .where('closed_at', '>=', monthStart)
    .count('id as count');

  const [{ total: wonMtdValue }] = await db('deals')
    .where({ tenant_id: tenantId, status: 'won' })
    .where('closed_at', '>=', monthStart)
    .sum('value as total');

  const [{ count: closedTotal }] = await db('deals')
    .where({ tenant_id: tenantId })
    .whereIn('status', ['won', 'lost'])
    .count('id as count');

  const [{ count: wonTotal }] = await db('deals')
    .where({ tenant_id: tenantId, status: 'won' })
    .count('id as count');

  const conversionRate = Number(closedTotal) > 0
    ? Math.round((Number(wonTotal) / Number(closedTotal)) * 100)
    : 0;

  const avgCycleResult = await db('deals')
    .where({ tenant_id: tenantId, status: 'won' })
    .whereNotNull('closed_at')
    .select(db.raw("AVG(EXTRACT(DAY FROM closed_at - created_at)) as avg_days"))
    .first();

  return {
    openDeals: Number(openDeals),
    wonMtd: Number(wonMtd),
    wonMtdValue: Number(wonMtdValue ?? 0),
    conversionRate,
    avgCycleDays: Math.round(Number(avgCycleResult?.avg_days ?? 0)),
  };
}

export async function getFunnel(tenantId: string, pipelineId?: string) {
  let stagesQ = db('pipeline_stages as ps')
    .join('pipelines as p', 'ps.pipeline_id', 'p.id')
    .where('ps.tenant_id', tenantId)
    .orderBy('ps.position', 'asc')
    .select('ps.id', 'ps.name', 'ps.color', 'ps.position');

  if (pipelineId) stagesQ = stagesQ.where('ps.pipeline_id', pipelineId);

  const stages = await stagesQ;
  const stageIds = stages.map((s) => s.id);

  const deals = stageIds.length
    ? await db('deals')
        .whereIn('stage_id', stageIds)
        .where({ tenant_id: tenantId, status: 'open' })
        .select('stage_id')
        .sum('value as total_value')
        .count('id as deal_count')
        .groupBy('stage_id')
    : [];

  return stages.map((s) => {
    const d = deals.find((x) => x.stage_id === s.id);
    return {
      stage_id: s.id,
      name: s.name,
      color: s.color,
      position: s.position,
      deal_count: Number(d?.deal_count ?? 0),
      total_value: Number(d?.total_value ?? 0),
    };
  });
}

export async function getRevenue(tenantId: string, period: 'week' | 'month' = 'month') {
  const trunc = period === 'week' ? 'week' : 'month';
  const interval = period === 'week' ? '12 weeks' : '12 months';

  const rows = await db('deals')
    .where({ tenant_id: tenantId, status: 'won' })
    .whereNotNull('closed_at')
    .where('closed_at', '>=', db.raw(`NOW() - INTERVAL '${interval}'`))
    .groupBy(db.raw(`DATE_TRUNC('${trunc}', closed_at)`))
    .orderBy(db.raw(`DATE_TRUNC('${trunc}', closed_at)`), 'asc')
    .select(
      db.raw(`DATE_TRUNC('${trunc}', closed_at) as period`),
      db.raw('COALESCE(SUM(value), 0) as total_value'),
      db.raw('COUNT(id) as deal_count'),
    );

  return rows.map((r: Record<string, unknown>) => ({
    period: new Date(r.period as string).toISOString(),
    totalValue: Number(r.total_value),
    dealCount: Number(r.deal_count),
  }));
}
