import { Request, Response } from 'express';
import { globalSearch } from './search.service';

export async function search(req: Request, res: Response) {
  const q = String(req.query.q ?? '').trim();
  if (!q || q.length < 2) {
    return res.json({ data: [] });
  }
  const results = await globalSearch(req.tenantId!, q);
  return res.json({ data: results });
}
