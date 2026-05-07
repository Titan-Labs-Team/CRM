import { Request, Response, NextFunction } from 'express';
import * as CalendarService from './calendar.service';
import { createEventSchema, updateEventSchema, listEventsQuerySchema } from './calendar.schema';

export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listEventsQuerySchema.parse(req.query);
    const data = await CalendarService.listEvents(req.user!.tenantId, query);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await CalendarService.getEvent(req.user!.tenantId, req.params.id);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createEventSchema.parse(req.body);
    const data = await CalendarService.createEvent(req.user!.tenantId, req.user!.id, input);
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateEventSchema.parse(req.body);
    const data = await CalendarService.updateEvent(req.user!.tenantId, req.params.id, input);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    await CalendarService.deleteEvent(req.user!.tenantId, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function addAttendee(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await CalendarService.addAttendee(
      req.user!.tenantId, req.params.id, req.params.userId,
    );
    res.json({ data });
  } catch (err) { next(err); }
}

export async function removeAttendee(req: Request, res: Response, next: NextFunction) {
  try {
    await CalendarService.removeAttendee(req.user!.tenantId, req.params.id, req.params.userId);
    res.status(204).send();
  } catch (err) { next(err); }
}
