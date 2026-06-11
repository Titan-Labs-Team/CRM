import { z } from 'zod';

export const registerSchema = z.object({
  workspaceName: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  fullName: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updateMeSchema = z.object({
  fullName: z.string().min(2).max(255).optional(),
  password: z.string().min(8).optional(),
});

export const switchWorkspaceSchema = z.object({
  tenantId: z.string().uuid(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type SwitchWorkspaceInput = z.infer<typeof switchWorkspaceSchema>;
