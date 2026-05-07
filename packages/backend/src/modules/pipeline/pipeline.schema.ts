import { z } from 'zod';

export const createPipelineSchema = z.object({
  name: z.string().min(1).max(255),
  isDefault: z.boolean().optional(),
});

export const updatePipelineSchema = createPipelineSchema.partial();

export const createStageSchema = z.object({
  name: z.string().min(1).max(255),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  position: z.number().int().min(0).optional(),
});

export const updateStageSchema = createStageSchema.partial();

export const reorderStagesSchema = z.object({
  stageIds: z.array(z.string().uuid()),
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;
export type CreateStageInput = z.infer<typeof createStageSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
