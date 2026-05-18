import { Request, Response } from 'express';
import {
  listNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
} from './notifications.service';

export async function list(req: Request, res: Response) {
  const data = await listNotifications(req.tenantId!, req.user!.id);
  return res.json({ data });
}

export async function unreadCount(req: Request, res: Response) {
  const count = await getUnreadCount(req.tenantId!, req.user!.id);
  return res.json({ data: { count } });
}

export async function read(req: Request, res: Response) {
  const n = await markRead(req.tenantId!, req.user!.id, req.params.id);
  return res.json({ data: n });
}

export async function readAll(req: Request, res: Response) {
  await markAllRead(req.tenantId!, req.user!.id);
  return res.status(204).send();
}
