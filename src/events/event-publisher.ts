import type { FastifyBaseLogger } from 'fastify';

export interface DomainEvent<TPayload = unknown> {
  name: string;
  payload: TPayload;
  occurredAt: string;
}

export class EventPublisher {
  constructor(private readonly logger: FastifyBaseLogger) {}

  async publish<TPayload>(name: string, payload: TPayload): Promise<DomainEvent<TPayload>> {
    const event: DomainEvent<TPayload> = {
      name,
      payload,
      occurredAt: new Date().toISOString()
    };

    // Replace this placeholder with Kafka, NATS, RabbitMQ, SQS, Pub/Sub, etc.
    this.logger.info({ event }, 'domain event published');

    return event;
  }
}
