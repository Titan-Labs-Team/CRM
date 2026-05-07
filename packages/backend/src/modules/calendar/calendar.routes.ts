import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import * as CalendarController from './calendar.controller';

const router = Router();

router.get('/', requireAuth, CalendarController.listEvents);
router.post('/', requireAuth, CalendarController.createEvent);
router.get('/:id', requireAuth, CalendarController.getEvent);
router.patch('/:id', requireAuth, CalendarController.updateEvent);
router.delete('/:id', requireAuth, CalendarController.deleteEvent);
router.post('/:id/attendees/:userId', requireAuth, CalendarController.addAttendee);
router.delete('/:id/attendees/:userId', requireAuth, CalendarController.removeAttendee);

export default router;
