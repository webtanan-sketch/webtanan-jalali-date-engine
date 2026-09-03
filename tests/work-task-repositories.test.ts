import { createWorkTask } from '../src/work/WorkTask';
import { MemoryWorkTaskRepository } from '../src/storage/MemoryWorkTaskRepository';
import { SqlWorkTaskRepository, type SqlExecutor, type SqlQueryResult } from '../src/storage/SqlWorkTaskRepository';
import { BetterSqlite3Executor } from '../src/storage/sql/BetterSqlite3Executor';
import { Mysql2Executor } from '../src/storage/sql/Mysql2Executor';

describe('WorkTask repositories', () => {
  test('memory repository supports CRUD, filters and pagination', async () => {
    const repo = new MemoryWorkTaskRepository();
    const tasks = [
      createWorkTask({ id: '1', date: '1405/06/10', title: 'تماس مشتری', assignee: 'رضا', category: 'فروش' }),
      createWorkTask({ id: '2', date: '1405/06/11', title: 'جلسه تولید', assignee: 'علی', category: 'تولید', status: 'in_progress' }),
      createWorkTask({ id: '3', date: '1405/06/12', title: 'تحویل', status: 'done' }),
    ];
    await repo.upsertMany(tasks);
    expect(await repo.count()).toBe(3);
    expect((await repo.query({ assignee: 'رضا' })).map((task) => task.id)).toEqual(['1']);
    expect((await repo.query({ from: '1405/06/11', to: '1405/06/12', limit: 1 })).map((task) => task.id)).toEqual(['2']);
    expect((await repo.get('2'))?.dateGregorian).toBe('2026-09-02');
    expect(await repo.delete('2')).toBe(true);
    expect(await repo.get('2')).toBeNull();
  });

  test('SQL repository generates SQLite and MySQL upsert statements', async () => {
    class Recorder implements SqlExecutor {
      calls: { sql: string; params: unknown[] }[] = [];
      async execute<Row = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<SqlQueryResult<Row>> {
        this.calls.push({ sql, params });
        if (sql.trim().startsWith('SELECT')) return { rows: [] };
        return { affectedRows: 1 };
      }
    }

    const task = createWorkTask({ id: 'sql-1', date: '1405/06/11', title: 'ثبت SQL' });
    const sqliteDriver = new Recorder();
    const sqliteRepo = new SqlWorkTaskRepository(sqliteDriver, { dialect: 'sqlite' });
    await sqliteRepo.install();
    await sqliteRepo.upsert(task);
    expect(sqliteDriver.calls.some((call) => call.sql.includes('ON CONFLICT(id)'))).toBe(true);
    expect(sqliteDriver.calls.some((call) => call.sql.includes('CREATE INDEX IF NOT EXISTS'))).toBe(true);

    const mysqlDriver = new Recorder();
    const mysqlRepo = new SqlWorkTaskRepository(mysqlDriver, { dialect: 'mysql' });
    await mysqlRepo.install();
    await mysqlRepo.upsert(task);
    expect(mysqlDriver.calls.some((call) => call.sql.includes('ON DUPLICATE KEY UPDATE'))).toBe(true);
  });

  test('SQL row maps back to WorkTaskRecord', async () => {
    const executor: SqlExecutor = {
      async execute<Row>(sql: string): Promise<SqlQueryResult<Row>> {
        if (!sql.startsWith('SELECT')) return { affectedRows: 1 };
        return {
          rows: [{
            id: 'r1', date_jalali: '1405/06/11', date_gregorian: '2026-09-02', title: 'کار',
            time_value: '08:30', end_time: null, status: 'todo', priority: 'normal', category: 'فروش',
            assignee: 'رضا', description: null, color: null, tags_json: '["مهم"]', created_by: 'admin',
            created_at: '2026-09-03T08:00:00.000Z', updated_at: '2026-09-03T08:00:00.000Z', completed_at: null,
          }] as Row[],
        };
      },
    };
    const repo = new SqlWorkTaskRepository(executor, { dialect: 'sqlite' });
    const record = await repo.get('r1');
    expect(record?.dateJalali).toBe('1405/06/11');
    expect(record?.tags).toEqual(['مهم']);
    expect(record?.assignee).toBe('رضا');
  });

  test('better-sqlite3 adapter distinguishes read and write statements', async () => {
    const calls: string[] = [];
    const adapter = new BetterSqlite3Executor({
      prepare(sql: string) {
        calls.push(sql);
        return {
          run: (..._params: unknown[]) => ({ changes: 2 }),
          all: (..._params: unknown[]) => [{ id: '1' }],
        };
      },
    });
    expect((await adapter.execute('SELECT * FROM tasks')).rows).toEqual([{ id: '1' }]);
    expect((await adapter.execute('DELETE FROM tasks')).affectedRows).toBe(2);
    expect(calls).toHaveLength(2);
  });

  test('mysql2 adapter maps row arrays and affectedRows', async () => {
    const read = new Mysql2Executor({ execute: async () => [[{ id: '1' }], []] });
    expect((await read.execute('SELECT * FROM tasks')).rows).toEqual([{ id: '1' }]);

    const write = new Mysql2Executor({ execute: async () => [{ affectedRows: 3 }, []] });
    expect((await write.execute('DELETE FROM tasks')).affectedRows).toBe(3);
  });
});
