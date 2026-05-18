import { Router, Request, Response, NextFunction } from 'express';
import { requireApiKey } from '../../shared/middleware/requireApiKey';
import { listContacts, createContact } from '../contacts/contacts.service';
import { listDeals } from '../deals/deals.service';
import { getPaginationParams } from '../../shared/utils/paginate';

const router = Router();

// GET /public/contacts
router.get(
  '/contacts',
  requireApiKey('read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.apiKey!.tenantId;
      const { page, limit } = getPaginationParams(req.query as Record<string, string>);
      const data = await listContacts(tenantId, { page, limit });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
);

// POST /public/contacts
router.post(
  '/contacts',
  requireApiKey('write'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.apiKey!.tenantId;
      const contact = await createContact(tenantId, req.body);
      res.status(201).json({ data: contact });
    } catch (err) {
      next(err);
    }
  },
);

// GET /public/deals
router.get(
  '/deals',
  requireApiKey('read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.apiKey!.tenantId;
      const { page, limit } = getPaginationParams(req.query as Record<string, string>);
      const data = await listDeals(tenantId, { page, limit });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
