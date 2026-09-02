import type { StorageAdapter } from './StorageAdapter';

export interface DatabaseStorageDriver {
  read(key: string): string | null | Promise<string | null>;
  write(key: string, value: string): void | Promise<void>;
  remove(key: string): void | Promise<void>;
}

export class DatabaseStorageAdapter implements StorageAdapter {
  constructor(private readonly driver: DatabaseStorageDriver) {}

  getItem(key: string): string | null | Promise<string | null> {
    return this.driver.read(key);
  }

  setItem(key: string, value: string): void | Promise<void> {
    return this.driver.write(key, value);
  }

  removeItem(key: string): void | Promise<void> {
    return this.driver.remove(key);
  }
}
