import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'pending_verification'], {
    message: 'Please select a valid status',
  }),
});

export type UpdateUserStatusInputType = z.infer<typeof updateUserStatusSchema>;

export const updateProjectStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived', 'private'], {
    message: 'Please select a valid status',
  }),
});

export type UpdateProjectStatusInputType = z.infer<
  typeof updateProjectStatusSchema
>;
