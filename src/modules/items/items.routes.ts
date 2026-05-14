import type { FastifyInstance, FastifyRequest } from 'fastify';
import { BadRequestError } from '../../common/errors.js';
import { createItemSchema, itemParamsSchema } from './items.schemas.js';
import type { ItemsService } from './items.service.js';

function formatZodIssues(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message
  }));
}

export function itemRoutes(service: ItemsService) {
  return async function routes(app: FastifyInstance): Promise<void> {
    app.get('/items', async () => ({
      ok: true,
      data: service.listItems()
    }));

    app.post('/items', async (request, reply) => {
      const parsed = createItemSchema.safeParse(request.body);

      if (!parsed.success) {
        throw new BadRequestError('Invalid item payload', formatZodIssues(parsed.error));
      }

      const item = service.createItem(parsed.data);
      reply.status(201);

      return {
        ok: true,
        data: item
      };
    });

    app.get('/items/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const parsed = itemParamsSchema.safeParse(request.params);

      if (!parsed.success) {
        throw new BadRequestError('Invalid item id', formatZodIssues(parsed.error));
      }

      return {
        ok: true,
        data: service.getItem(parsed.data.id)
      };
    });
  };
}
