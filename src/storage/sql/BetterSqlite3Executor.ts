import type { SqlExecutor, SqlQueryResult } from '../SqlWorkTaskRepository';

export interface BetterSqlite3StatementLike {
  run(...params: unknown[]): { changes?: number };
  all(...params: unknown[]): Record<string, unknown>[];
}

export interface BetterSqlite3DatabaseLike {
  prepare(sql: string): BetterSqlite3StatementLike;
}

/**
 * Adapter بدون وابستگی runtime. یک instance از better-sqlite3 یا wrapper سازگار را تزریق کنید.
 */
export class BetterSqlite3Executor implements SqlExecutor {
  constructor(private readonly database: BetterSqlite3DatabaseLike) {}

  async execute<Row = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<SqlQueryResult<Row>> {
    const statement = this.database.prepare(sql);
    const normalized = sql.trim().toUpperCase();
    if (normalized.startsWith('SELECT') || normalized.startsWith('PRAGMA') || normalized.startsWith('WITH')) {
      return { rows: statement.all(...params) as Row[] };
    }
    const result = statement.run(...params);
    return { affectedRows: result.changes ?? 0 };
  }
}
