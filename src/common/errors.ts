export type ErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'INTERNAL_ERROR'
  | 'UPSTREAM_ERROR';

export interface AppErrorOptions {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
  expose?: boolean;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly expose: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    this.expose = options.expose ?? options.statusCode < 500;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super({ statusCode: 400, code: 'BAD_REQUEST', message, details });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super({ statusCode: 404, code: 'NOT_FOUND', message, details });
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(message = 'Method not allowed', details?: unknown) {
    super({ statusCode: 405, code: 'METHOD_NOT_ALLOWED', message, details });
  }
}

export class UpstreamError extends AppError {
  constructor(message = 'Upstream service failed', details?: unknown) {
    super({ statusCode: 502, code: 'UPSTREAM_ERROR', message, details, expose: false });
  }
}
