import type { FastifyBaseLogger } from 'fastify';

export interface ExampleJob {
  id: string;
  type: 'example';
  payload: Record<string, unknown>;
}

export async function processExampleJob(job: ExampleJob, logger: FastifyBaseLogger): Promise<void> {
  logger.info({ jobId: job.id, jobType: job.type }, 'processing example job');

  // Add queue/worker logic here.
}
