import { z } from 'zod';

export const createActivitySchema = z.object({
  dealId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  type: z.enum(['note', 'call', 'email', 'meeting', 'task']),
  title: z.string().min(1),
  body: z.string().optional(),
  dueAt: z.string().datetime({ offset: true }).optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

export const listActivitiesQuerySchema = z.object({
  dealId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  type: z.enum(['note', 'call', 'email', 'meeting', 'task']).optional(),
  isDone: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>;
