import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './errors.js';
import { allowedMethodsForPath } from './known-routes.js';

interface ErrorPayload {
  ok: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

function buildErrorPayload(request: FastifyRequest, error: AppError): ErrorPayload {
  return {
    ok: false,
    error: {
      code: error.code,
      message: error.expose ? error.message : 'Internal server error',
      requestId: request.id,
      ...(error.details === undefined ? {} : { details: error.details })
    }
  };
}

function getPathname(request: FastifyRequest): string {
  return new URL(request.url, 'http://localhost').pathname;
}

function handleAppError(error: AppError, request: FastifyRequest, reply: FastifyReply): void {
  reply.status(error.statusCode).send(buildErrorPayload(request, error));
}

function mapFastifyError(error: FastifyError): AppError {
  const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;

  if (statusCode === 400) {
    return new AppError({
      statusCode: 400,
      code: 'BAD_REQUEST',
      message: error.message || 'Bad request',
      details: error.validation
    });
  }

  return new AppError({
    statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    code: statusCode >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
    message: statusCode >= 500 ? 'Internal server error' : error.message,
    expose: statusCode < 500
  });
}

export function registerErrorHandlers(app: FastifyInstance): void {
  app.setNotFoundHandler((request, reply) => {
    const allowedMethods = allowedMethodsForPath(getPathname(request));

    if (allowedMethods && !allowedMethods.includes(request.method)) {
      reply.header('allow', allowedMethods.join(', '));
      handleAppError(
        new AppError({
          statusCode: 405,
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${request.method} is not allowed for this route`,
          details: { allowedMethods }
        }),
        request,
        reply
      );
      return;
    }

    handleAppError(
      new AppError({
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Route not found',
        details: { path: getPathname(request) }
      }),
      request,
      reply
    );
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      if (error.statusCode >= 500) {
        request.log.error({ err: error }, 'application error');
      }
      handleAppError(error, request, reply);
      return;
    }

    const mappedError = mapFastifyError(error as FastifyError);
    if (mappedError.statusCode >= 500) {
      request.log.error({ err: error }, 'unexpected error');
    }
    handleAppError(mappedError, request, reply);
  });
}
