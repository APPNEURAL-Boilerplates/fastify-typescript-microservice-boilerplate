import { UpstreamError } from '../common/errors.js';

export interface HttpClientOptions {
  baseUrl: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  async getJson<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.requestJson<T>('GET', path, undefined, headers);
  }

  async postJson<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.requestJson<T>('POST', path, body, headers);
  }

  private async requestJson<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          ...this.defaultHeaders,
          ...headers,
          ...(body === undefined ? {} : { 'content-type': 'application/json' })
        },
        body: body === undefined ? undefined : JSON.stringify(body)
      });

      if (!response.ok) {
        throw new UpstreamError(`Upstream request failed with status ${response.status}`, {
          method,
          path,
          status: response.status
        });
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof UpstreamError) {
        throw error;
      }

      throw new UpstreamError('Upstream request failed', {
        method,
        path,
        cause: error instanceof Error ? error.message : String(error)
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
