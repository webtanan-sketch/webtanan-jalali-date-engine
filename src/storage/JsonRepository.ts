import type { StorageAdapter } from './StorageAdapter';

export interface StoredEnvelope<T> {
  schema: string;
  savedAt: string;
  data: T;
}

export interface JsonRepositoryOptions {
  schema?: string;
}

export class JsonRepository<T> {
  private readonly schema: string;

  constructor(
    private readonly storage: StorageAdapter,
    private readonly key: string,
    options: JsonRepositoryOptions = {},
  ) {
    if (!key.trim()) throw new RangeError('کلید ذخیره‌سازی نمی‌تواند خالی باشد.');
    this.schema = options.schema ?? 'webtanan-jalali-date-engine/v1';
  }

  async save(data: T): Promise<StoredEnvelope<T>> {
    const envelope: StoredEnvelope<T> = {
      schema: this.schema,
      savedAt: new Date().toISOString(),
      data,
    };

    await this.storage.setItem(this.key, JSON.stringify(envelope));
    return envelope;
  }

  async load(): Promise<T | null> {
    const raw = await this.storage.getItem(this.key);
    if (raw === null) return null;

    let envelope: StoredEnvelope<T>;
    try {
      envelope = JSON.parse(raw) as StoredEnvelope<T>;
    } catch {
      throw new Error(`داده ذخیره‌شده برای کلید ${this.key} JSON معتبر نیست.`);
    }

    if (!envelope || envelope.schema !== this.schema || !('data' in envelope)) {
      throw new Error(`نسخه ساختار داده برای کلید ${this.key} پشتیبانی نمی‌شود.`);
    }

    return envelope.data;
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(this.key);
  }
}
