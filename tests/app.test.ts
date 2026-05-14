import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { AppConfig } from '../src/config/env.js';

const testConfig: AppConfig = {
  NODE_ENV: 'test',
  SERVICE_NAME: 'nodejs-microservice-test',
  HOST: '127.0.0.1',
  PORT: 3000,
  LOG_LEVEL: 'silent',
  REQUEST_ID_HEADER: 'x-request-id',
  CORS_ORIGIN: undefined
};

describe('Node.js microservice boilerplate', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp(testConfig);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns root metadata', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      service: 'nodejs-microservice-test'
    });
  });

  it('returns health status', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      status: 'healthy'
    });
  });

  it('returns readiness status', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/ready' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      status: 'ready'
    });
  });

  it('creates an item', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/items',
      payload: {
        name: 'Example item',
        price: 10
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data).toMatchObject({
      name: 'Example item',
      price: 10
    });
  });

  it('lists items', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/items',
      payload: { name: 'Example item' }
    });

    const response = await app.inject({ method: 'GET', url: '/api/v1/items' });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveLength(1);
  });

  it('gets an item by id', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/items',
      payload: { name: 'Example item' }
    });

    const itemId = created.json().data.id;

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/items/${itemId}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.id).toBe(itemId);
  });

  it('returns 400 for invalid item payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/items',
      payload: { name: '' }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('BAD_REQUEST');
  });

  it('returns 400 for malformed JSON', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/items',
      payload: '{bad json',
      headers: {
        'content-type': 'application/json'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('BAD_REQUEST');
  });

  it('returns 404 for unknown routes', async () => {
    const response = await app.inject({ method: 'GET', url: '/missing' });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('NOT_FOUND');
  });

  it('returns 405 for unsupported methods on known routes', async () => {
    const response = await app.inject({ method: 'DELETE', url: '/api/v1/items' });

    expect(response.statusCode).toBe(405);
    expect(response.headers.allow).toBe('GET, POST');
    expect(response.json().error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('echoes request id header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: {
        'x-request-id': 'test-request-id'
      }
    });

    expect(response.headers['x-request-id']).toBe('test-request-id');
  });
});
