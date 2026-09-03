import type { SqlExecutor, SqlQueryResult } from '../SqlWorkTaskRepository';

export interface Mysql2ConnectionLike {
  execute(sql: string, params?: unknown[]): Promise<[unknown, unknown]>;
}

/**
 * Adapter بدون وابستگی runtime. یک connection/pool از mysql2/promise یا wrapper سازگار را تزریق کنید.
 */
export class Mysql2Executor implements SqlExecutor {
  constructor(private readonly connection: Mysql2ConnectionLike) {}

  async execute<Row = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<SqlQueryResult<Row>> {
    const [result] = await this.connection.execute(sql, params);
    if (Array.isArray(result)) return { rows: result as Row[] };
    const object = result as { affectedRows?: number };
    return { affectedRows: object.affectedRows ?? 0 };
  }
}
