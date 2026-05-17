import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as ContactsService from './contacts.service';

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype === 'text/csv' || file.originalname.endsWith('.csv'));
  },
});
import {
  createContactSchema,
  updateContactSchema,
  listContactsQuerySchema,
} from './contacts.schema';

export async function listContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listContactsQuerySchema.parse(req.query);
    const result = await ContactsService.listContacts(req.user!.tenantId, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getContact(req: Request, res: Response, next: NextFunction) {
  try {
    const contact = await ContactsService.getContact(req.user!.tenantId, req.params.id);
    res.json({ data: contact });
  } catch (err) {
    next(err);
  }
}

export async function createContact(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createContactSchema.parse(req.body);
    const contact = await ContactsService.createContact(req.user!.tenantId, input);
    res.status(201).json({ data: contact });
  } catch (err) {
    next(err);
  }
}

export async function updateContact(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateContactSchema.parse(req.body);
    const contact = await ContactsService.updateContact(req.user!.tenantId, req.params.id, input);
    res.json({ data: contact });
  } catch (err) {
    next(err);
  }
}

export async function deleteContact(req: Request, res: Response, next: NextFunction) {
  try {
    await ContactsService.deleteContact(req.user!.tenantId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function importContacts(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) { res.status(400).json({ error: 'CSV file required' }); return; }
    const result = await ContactsService.importContactsCsv(req.user!.tenantId, req.file.buffer);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

export async function exportContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await ContactsService.exportContactsCsv(req.user!.tenantId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
