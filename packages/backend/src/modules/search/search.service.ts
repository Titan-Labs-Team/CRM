import { db } from '../../db';

export interface SearchResult {
  id: string;
  type: 'contact' | 'deal' | 'activity';
  title: string;
  subtitle?: string;
  url: string;
}

export async function globalSearch(tenantId: string, q: string): Promise<SearchResult[]> {
  const like = `%${q}%`;

  const [contacts, deals, activities] = await Promise.all([
    db('contacts')
      .where({ tenant_id: tenantId })
      .whereRaw('full_name ILIKE ? OR email ILIKE ? OR phone ILIKE ?', [like, like, like])
      .limit(5)
      .select('id', 'full_name', 'email', 'type'),

    db('deals as d')
      .leftJoin('pipeline_stages as ps', 'd.stage_id', 'ps.id')
      .where('d.tenant_id', tenantId)
      .whereRaw('d.title ILIKE ?', [like])
      .limit(5)
      .select('d.id', 'd.title', 'd.status', 'd.value', 'd.currency', db.raw('ps.name as stage_name')),

    db('activities')
      .where({ tenant_id: tenantId })
      .whereRaw('title ILIKE ? OR body ILIKE ?', [like, like])
      .limit(5)
      .select('id', 'title', 'type', 'due_at'),
  ]);

  const results: SearchResult[] = [
    ...contacts.map((c) => ({
      id: c.id,
      type: 'contact' as const,
      title: c.full_name,
      subtitle: c.email || c.type,
      url: `/contacts/${c.id}`,
    })),
    ...deals.map((d) => ({
      id: d.id,
      type: 'deal' as const,
      title: d.title,
      subtitle: d.stage_name || d.status,
      url: `/deals/${d.id}`,
    })),
    ...activities.map((a) => ({
      id: a.id,
      type: 'activity' as const,
      title: a.title,
      subtitle: a.type,
      url: `/calendar`,
    })),
  ];

  return results;
}
