import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../../config/env.js';

export function healthRoutes(config: AppConfig) {
  return async function routes(app: FastifyInstance): Promise<void> {
    app.get('/health', async () => ({
      ok: true,
      status: 'healthy',
      service: config.SERVICE_NAME,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));

    app.get('/ready', async () => ({
      ok: true,
      status: 'ready',
      service: config.SERVICE_NAME,
      timestamp: new Date().toISOString()
    }));
  };
}
