import type { StorageAdapter } from './StorageAdapter';

export interface FetchResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

export type FetchLike = (
  input: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
) => Promise<FetchResponseLike>;

export interface RestStorageAdapterOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  fetcher?: FetchLike;
}

export class RestStorageAdapter implements StorageAdapter {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly fetcher: FetchLike;

  constructor(options: RestStorageAdapterOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) };

    const globalFetcher = typeof fetch === 'function' ? (fetch.bind(globalThis) as unknown as FetchLike) : undefined;
    const resolved = options.fetcher ?? globalFetcher;
    if (!resolved) throw new Error('RestStorageAdapter به fetch یا fetcher سفارشی نیاز دارد.');
    this.fetcher = resolved;
  }

  private url(key: string): string {
    return `${this.baseUrl}/${encodeURIComponent(key)}`;
  }

  async getItem(key: string): Promise<string | null> {
    const response = await this.fetcher(this.url(key), { method: 'GET', headers: this.headers });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`خطا در دریافت داده از REST API: HTTP ${response.status}`);
    return response.text();
  }

  async setItem(key: string, value: string): Promise<void> {
    const response = await this.fetcher(this.url(key), {
      method: 'PUT',
      headers: this.headers,
      body: value,
    });
    if (!response.ok) throw new Error(`خطا در ذخیره داده در REST API: HTTP ${response.status}`);
  }

  async removeItem(key: string): Promise<void> {
    const response = await this.fetcher(this.url(key), { method: 'DELETE', headers: this.headers });
    if (!response.ok && response.status !== 404) {
      throw new Error(`خطا در حذف داده از REST API: HTTP ${response.status}`);
    }
  }
}
