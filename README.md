# Node.js Microservice Boilerplate

Production-ready Node.js + TypeScript microservice boilerplate using Fastify.

## Features

- TypeScript strict mode
- Fastify app factory pattern
- Versioned REST API under `/api/v1`
- Health and readiness endpoints
- Example `items` module with route/service/repository layers
- Central JSON error handling
- Request ID propagation with `x-request-id`
- Zod environment validation
- Pino-powered Fastify logging
- Placeholder event publisher for Kafka/NATS/RabbitMQ/SQS/Pub/Sub
- Placeholder worker module
- Vitest test suite using `fastify.inject()`
- Dockerfile, Docker Compose, Makefile, and GitHub Actions CI

## Requirements

- Node.js 20 or newer
- npm

The `.nvmrc` file uses Node.js 22.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
http://localhost:3000/api/v1/health
http://localhost:3000/api/v1/ready
```

## Scripts

```bash
npm run dev          # Start development server with watch mode
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled app
npm run typecheck    # TypeScript check
npm test             # Run tests
npm run check        # Typecheck + tests
npm run clean        # Remove dist and coverage
```

## API

### Root

```http
GET /
```

### Health

```http
GET /api/v1/health
GET /api/v1/ready
```

### Items

```http
GET  /api/v1/items
POST /api/v1/items
GET  /api/v1/items/:id
```

Example create request:

```bash
curl -X POST http://localhost:3000/api/v1/items \
  -H "content-type: application/json" \
  -d '{"name":"Example item","price":10}'
```

## Environment variables

Copy `.env.example` to `.env`.

```env
NODE_ENV=development
SERVICE_NAME=nodejs-microservice
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info
REQUEST_ID_HEADER=x-request-id
```

Never commit secrets to `.env`. Use your platform's secret manager for production credentials.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## Folder structure

```txt
nodejs-microservice-boilerplate/
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ config/
│  │  └─ env.ts
│  ├─ common/
│  │  ├─ error-handler.ts
│  │  ├─ errors.ts
│  │  └─ known-routes.ts
│  ├─ modules/
│  │  ├─ health/
│  │  │  └─ health.routes.ts
│  │  └─ items/
│  │     ├─ items.repository.ts
│  │     ├─ items.routes.ts
│  │     ├─ items.schemas.ts
│  │     └─ items.service.ts
│  ├─ clients/
│  │  └─ http-client.ts
│  ├─ events/
│  │  └─ event-publisher.ts
│  └─ workers/
│     └─ example.worker.ts
├─ tests/
│  └─ app.test.ts
├─ Dockerfile
├─ docker-compose.yml
├─ Makefile
├─ package.json
├─ tsconfig.json
├─ vitest.config.ts
└─ README.md
```

## How to extend

- Add database code under `src/modules/<feature>/`.
- Replace `ItemsRepository` with PostgreSQL, MongoDB, Redis, Prisma, Drizzle, or TypeORM.
- Replace `EventPublisher` with Kafka, NATS, RabbitMQ, SQS, Google Pub/Sub, or Redis Streams.
- Add auth as a Fastify hook or plugin.
- Add OpenTelemetry for tracing once the service is deployed.
