import { db } from '../../db';

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
