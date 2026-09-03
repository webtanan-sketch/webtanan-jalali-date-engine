import type { WorkTaskRecord } from '../work/WorkTask';
import { filterWorkTaskRecords, type WorkTaskRepository, type WorkTaskRepositoryQuery } from './WorkTaskRepository';

export interface IndexedDbWorkTaskRepositoryOptions {
  databaseName?: string;
  storeName?: string;
  version?: number;
}

export class IndexedDbWorkTaskRepository implements WorkTaskRepository {
  private readonly databaseName: string;
  private readonly storeName: string;
  private readonly version: number;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(options: IndexedDbWorkTaskRepositoryOptions = {}) {
    this.databaseName = options.databaseName ?? 'webtanan-jalali-date-engine';
    this.storeName = options.storeName ?? 'calendar_tasks';
    this.version = options.version ?? 1;
  }

  async install(): Promise<void> {
    await this.db();
  }

  async upsert(task: WorkTaskRecord): Promise<void> {
    const db = await this.db();
    await this.request<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).put({ ...task, tags: [...task.tags] });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('خطا در ذخیره Task در IndexedDB.'));
      tx.onabort = () => reject(tx.error ?? new Error('ذخیره Task لغو شد.'));
    });
  }

  async upsertMany(tasks: WorkTaskRecord[]): Promise<void> {
    if (!tasks.length) return;
    const db = await this.db();
    await this.request<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      tasks.forEach((task) => store.put({ ...task, tags: [...task.tags] }));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('خطا در ذخیره گروهی Taskها.'));
      tx.onabort = () => reject(tx.error ?? new Error('ذخیره گروهی Taskها لغو شد.'));
    });
  }

  async get(id: string): Promise<WorkTaskRecord | null> {
    const db = await this.db();
    return this.request<WorkTaskRecord | null>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const req = tx.objectStore(this.storeName).get(id);
      req.onsuccess = () => {
        const value = req.result as WorkTaskRecord | undefined;
        resolve(value ? { ...value, tags: [...value.tags] } : null);
      };
      req.onerror = () => reject(req.error ?? new Error('خطا در خواندن Task از IndexedDB.'));
    });
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.get(id);
    if (!existing) return false;
    const db = await this.db();
    await this.request<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('خطا در حذف Task.'));
    });
    return true;
  }

  async query(query: WorkTaskRepositoryQuery = {}): Promise<WorkTaskRecord[]> {
    const records = await this.getAll();
    return filterWorkTaskRecords(records, query);
  }

  async count(query: WorkTaskRepositoryQuery = {}): Promise<number> {
    const records = await this.getAll();
    return filterWorkTaskRecords(records, { ...query, limit: undefined, offset: undefined }).length;
  }

  async clear(): Promise<void> {
    const db = await this.db();
    await this.request<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('خطا در پاک‌سازی IndexedDB.'));
    });
  }

  private async getAll(): Promise<WorkTaskRecord[]> {
    const db = await this.db();
    return this.request<WorkTaskRecord[]>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const req = tx.objectStore(this.storeName).getAll();
      req.onsuccess = () => resolve((req.result as WorkTaskRecord[]).map((task) => ({ ...task, tags: [...task.tags] })));
      req.onerror = () => reject(req.error ?? new Error('خطا در خواندن Taskها از IndexedDB.'));
    });
  }

  private db(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('IndexedDB در این محیط در دسترس نیست.'));
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, this.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('dateJalali', 'dateJalali', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('assignee', 'assignee', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('بازکردن IndexedDB ناموفق بود.'));
      request.onblocked = () => reject(new Error('ارتقای IndexedDB توسط اتصال دیگری مسدود شده است.'));
    });
    return this.dbPromise;
  }

  private request<T>(executor: (resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): Promise<T> {
    return new Promise<T>(executor);
  }
}
