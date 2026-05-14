import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  description: z.string().trim().min(1).optional(),
  price: z.number().nonnegative().optional()
});

export const itemParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required')
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
