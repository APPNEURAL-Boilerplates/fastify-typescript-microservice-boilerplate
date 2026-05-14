import type { EventPublisher } from './events/event-publisher.js';

declare module 'fastify' {
  interface FastifyInstance {
    events: EventPublisher;
  }
}
