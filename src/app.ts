import { randomUUID } from 'node:crypto';
import fastify, { type FastifyInstance } from 'fastify';
import { registerErrorHandlers } from './common/error-handler.js';
import type { AppConfig } from './config/env.js';
import { loadConfig } from './config/env.js';
import { EventPublisher } from './events/event-publisher.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { itemRoutes } from './modules/items/items.routes.js';
import { ItemsRepository } from './modules/items/items.repository.js';
import { ItemsService } from './modules/items/items.service.js';

export async function buildApp(config: AppConfig = loadConfig()): Promise<FastifyInstance> {
  const app = fastify({
    logger: config.NODE_ENV === 'test' ? false : { level: config.LOG_LEVEL },
    genReqId: (request) => {
      const requestId = request.headers[config.REQUEST_ID_HEADER];
      return typeof requestId === 'string' && requestId.length > 0 ? requestId : randomUUID();
    },
    trustProxy: true
  });

  app.addHook('onRequest', async (request, reply) => {
    reply.header(config.REQUEST_ID_HEADER, request.id);
  });

  registerErrorHandlers(app);

  app.get('/', async () => ({
    ok: true,
    service: config.SERVICE_NAME,
    message: 'Node.js microservice is running',
    endpoints: {
      health: '/api/v1/health',
      readiness: '/api/v1/ready',
      items: '/api/v1/items'
    }
  }));

  const itemsRepository = new ItemsRepository();
  const itemsService = new ItemsService(itemsRepository);
  const eventPublisher = new EventPublisher(app.log);

  app.decorate('events', eventPublisher);

  await app.register(healthRoutes(config), { prefix: '/api/v1' });
  await app.register(itemRoutes(itemsService), { prefix: '/api/v1' });

  return app;
}
