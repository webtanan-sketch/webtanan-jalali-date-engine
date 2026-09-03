import type { WorkTaskRecord } from '../work/WorkTask';
import { filterWorkTaskRecords, type WorkTaskRepository, type WorkTaskRepositoryQuery } from './WorkTaskRepository';

export type SqlDialect = 'sqlite' | 'mysql';

export interface SqlQueryResult<Row = Record<string, unknown>> {
  rows?: Row[];
  affectedRows?: number;
}

export interface SqlExecutor {
  execute<Row = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<SqlQueryResult<Row>>;
}

export interface SqlWorkTaskRepositoryOptions {
  dialect: SqlDialect;
  table?: string;
}

type TaskRow = {
  id: string;
  date_jalali: string;
  date_gregorian: string;
  title: string;
  time_value: string | null;
  end_time: string | null;
  status: WorkTaskRecord['status'];
  priority: WorkTaskRecord['priority'];
  category: string | null;
  assignee: string | null;
  description: string | null;
  color: string | null;
  tags_json: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

const assertTable = (value: string): string => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw new RangeError('نام جدول SQL نامعتبر است.');
  return value;
};

export class SqlWorkTaskRepository implements WorkTaskRepository {
  private readonly dialect: SqlDialect;
  private readonly table: string;

  constructor(private readonly executor: SqlExecutor, options: SqlWorkTaskRepositoryOptions) {
    this.dialect = options.dialect;
    this.table = assertTable(options.table ?? 'webtanan_calendar_tasks');
  }

  async install(): Promise<void> {
    const auto = this.dialect === 'mysql' ? 'VARCHAR(191)' : 'TEXT';
    await this.executor.execute(`CREATE TABLE IF NOT EXISTS ${this.table} (
      id ${auto} PRIMARY KEY,
      date_jalali VARCHAR(10) NOT NULL,
      date_gregorian VARCHAR(10) NOT NULL,
      title VARCHAR(255) NOT NULL,
      time_value VARCHAR(8) NULL,
      end_time VARCHAR(8) NULL,
      status VARCHAR(20) NOT NULL,
      priority VARCHAR(20) NOT NULL,
      category VARCHAR(191) NULL,
      assignee VARCHAR(191) NULL,
      description TEXT NULL,
      color VARCHAR(40) NULL,
      tags_json TEXT NOT NULL,
      created_by VARCHAR(191) NULL,
      created_at VARCHAR(40) NOT NULL,
      updated_at VARCHAR(40) NOT NULL,
      completed_at VARCHAR(40) NULL
    )`);

    // CREATE INDEX IF NOT EXISTS در MySQL روی نسخه‌های مختلف سازگاری یکسانی ندارد؛
    // ایندکس‌ها در migration محیط میزبان نیز قابل تعریف هستند.
    if (this.dialect === 'sqlite') {
      await this.executor.execute(`CREATE INDEX IF NOT EXISTS idx_${this.table}_date ON ${this.table}(date_jalali)`);
      await this.executor.execute(`CREATE INDEX IF NOT EXISTS idx_${this.table}_status ON ${this.table}(status)`);
      await this.executor.execute(`CREATE INDEX IF NOT EXISTS idx_${this.table}_assignee ON ${this.table}(assignee)`);
    }
  }

  async upsert(task: WorkTaskRecord): Promise<void> {
    const values = this.values(task);
    const columns = 'id,date_jalali,date_gregorian,title,time_value,end_time,status,priority,category,assignee,description,color,tags_json,created_by,created_at,updated_at,completed_at';
    const placeholders = new Array(17).fill('?').join(',');

    if (this.dialect === 'sqlite') {
      await this.executor.execute(
        `INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})
         ON CONFLICT(id) DO UPDATE SET
          date_jalali=excluded.date_jalali,date_gregorian=excluded.date_gregorian,title=excluded.title,
          time_value=excluded.time_value,end_time=excluded.end_time,status=excluded.status,priority=excluded.priority,
          category=excluded.category,assignee=excluded.assignee,description=excluded.description,color=excluded.color,
          tags_json=excluded.tags_json,created_by=excluded.created_by,created_at=excluded.created_at,
          updated_at=excluded.updated_at,completed_at=excluded.completed_at`,
        values,
      );
      return;
    }

    await this.executor.execute(
      `INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})
       ON DUPLICATE KEY UPDATE
        date_jalali=VALUES(date_jalali),date_gregorian=VALUES(date_gregorian),title=VALUES(title),
        time_value=VALUES(time_value),end_time=VALUES(end_time),status=VALUES(status),priority=VALUES(priority),
        category=VALUES(category),assignee=VALUES(assignee),description=VALUES(description),color=VALUES(color),
        tags_json=VALUES(tags_json),created_by=VALUES(created_by),created_at=VALUES(created_at),
        updated_at=VALUES(updated_at),completed_at=VALUES(completed_at)`,
      values,
    );
  }

  async upsertMany(tasks: WorkTaskRecord[]): Promise<void> {
    for (const task of tasks) await this.upsert(task);
  }

  async get(id: string): Promise<WorkTaskRecord | null> {
    const result = await this.executor.execute<TaskRow>(`SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`, [id]);
    const row = result.rows?.[0];
    return row ? this.fromRow(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.executor.execute(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    return (result.affectedRows ?? 0) > 0;
  }

  async query(query: WorkTaskRepositoryQuery = {}): Promise<WorkTaskRecord[]> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (query.from) { where.push('date_jalali >= ?'); params.push(query.from); }
    if (query.to) { where.push('date_jalali <= ?'); params.push(query.to); }
    if (query.assignee) { where.push('assignee = ?'); params.push(query.assignee); }
    if (query.category) { where.push('category = ?'); params.push(query.category); }
    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      where.push(`status IN (${statuses.map(() => '?').join(',')})`);
      params.push(...statuses);
    }

    const sql = `SELECT * FROM ${this.table}${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY date_jalali,time_value,id`;
    const result = await this.executor.execute<TaskRow>(sql, params);
    const mapped = (result.rows ?? []).map((row) => this.fromRow(row));
    // search/limit/offset را مشترک نگه می‌داریم تا رفتار SQLite/MySQL یکسان باشد.
    return filterWorkTaskRecords(mapped, query);
  }

  async count(query: WorkTaskRepositoryQuery = {}): Promise<number> {
    return (await this.query({ ...query, limit: undefined, offset: undefined })).length;
  }

  async clear(): Promise<void> {
    await this.executor.execute(`DELETE FROM ${this.table}`);
  }

  private values(task: WorkTaskRecord): unknown[] {
    return [
      task.id, task.dateJalali, task.dateGregorian, task.title, task.time ?? null, task.endTime ?? null,
      task.status, task.priority, task.category ?? null, task.assignee ?? null, task.description ?? null,
      task.color ?? null, JSON.stringify(task.tags), task.createdBy ?? null, task.createdAt, task.updatedAt,
      task.completedAt ?? null,
    ];
  }

  private fromRow(row: TaskRow): WorkTaskRecord {
    let tags: string[] = [];
    try {
      const parsed = JSON.parse(row.tags_json);
      if (Array.isArray(parsed)) tags = parsed.map(String);
    } catch { tags = []; }
    return {
      id: row.id,
      dateJalali: row.date_jalali,
      dateGregorian: row.date_gregorian,
      title: row.title,
      time: row.time_value ?? undefined,
      endTime: row.end_time ?? undefined,
      status: row.status,
      priority: row.priority,
      category: row.category ?? undefined,
      assignee: row.assignee ?? undefined,
      description: row.description ?? undefined,
      color: row.color ?? undefined,
      tags,
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at ?? undefined,
    };
  }
}
