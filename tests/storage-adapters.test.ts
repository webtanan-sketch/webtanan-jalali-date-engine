import { DatabaseStorageAdapter } from '../src/storage/DatabaseStorageAdapter';
import { RestStorageAdapter, type FetchLike } from '../src/storage/RestStorageAdapter';

describe('Storage adapters', () => {
  test('DatabaseStorageAdapter قرارداد StorageAdapter را اجرا می‌کند', async () => {
    const data = new Map<string, string>();
    const adapter = new DatabaseStorageAdapter({
      read: (key) => data.get(key) ?? null,
      write: (key, value) => { data.set(key, value); },
      remove: (key) => { data.delete(key); },
    });

    await adapter.setItem('calendar', '{"ok":true}');
    expect(await adapter.getItem('calendar')).toBe('{"ok":true}');
    await adapter.removeItem('calendar');
    expect(await adapter.getItem('calendar')).toBeNull();
  });

  test('RestStorageAdapter عملیات GET/PUT/DELETE را درست نگاشت می‌کند', async () => {
    const data = new Map<string, string>();
    const fetcher: FetchLike = async (url, init) => {
      const key = decodeURIComponent(url.split('/').pop() ?? '');
      const method = init?.method ?? 'GET';

      if (method === 'PUT') {
        data.set(key, init?.body ?? '');
        return { ok: true, status: 204, text: async () => '' };
      }
      if (method === 'DELETE') {
        data.delete(key);
        return { ok: true, status: 204, text: async () => '' };
      }
      if (!data.has(key)) return { ok: false, status: 404, text: async () => '' };
      return { ok: true, status: 200, text: async () => data.get(key) ?? '' };
    };

    const adapter = new RestStorageAdapter({ baseUrl: 'https://example.test/calendar', fetcher });
    await adapter.setItem('user:12', '{"date":"1405/06/11"}');
    expect(await adapter.getItem('user:12')).toBe('{"date":"1405/06/11"}');
    await adapter.removeItem('user:12');
    expect(await adapter.getItem('user:12')).toBeNull();
  });

  test('خطای HTTP در REST به خطای برنامه تبدیل می‌شود', async () => {
    const fetcher: FetchLike = async () => ({ ok: false, status: 500, text: async () => 'error' });
    const adapter = new RestStorageAdapter({ baseUrl: 'https://example.test/calendar', fetcher });
    await expect(adapter.getItem('x')).rejects.toThrow('HTTP 500');
  });
});
