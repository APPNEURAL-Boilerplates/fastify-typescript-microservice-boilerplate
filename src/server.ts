import { buildApp } from './app.js';
import { loadConfig } from './config/env.js';

async function start(): Promise<void> {
  const config = loadConfig();
  const app = await buildApp(config);

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    app.log.info({ signal }, 'shutdown signal received');

    try {
      await app.close();
      app.log.info('server closed');
      process.exit(0);
    } catch (error) {
      app.log.error({ err: error }, 'error during shutdown');
      process.exit(1);
    }
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  try {
    await app.listen({ host: config.HOST, port: config.PORT });
  } catch (error) {
    app.log.error({ err: error }, 'failed to start server');
    process.exit(1);
  }
}

void start();
