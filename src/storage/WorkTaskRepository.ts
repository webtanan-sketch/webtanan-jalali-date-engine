import type { WorkTaskRecord, WorkTaskStatus } from '../work/WorkTask';

export interface WorkTaskRepositoryQuery {
  from?: string;
  to?: string;
  status?: WorkTaskStatus | WorkTaskStatus[];
  assignee?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface WorkTaskRepository {
  install?(): Promise<void>;
  upsert(task: WorkTaskRecord): Promise<void>;
  upsertMany(tasks: WorkTaskRecord[]): Promise<void>;
  get(id: string): Promise<WorkTaskRecord | null>;
  delete(id: string): Promise<boolean>;
  query(query?: WorkTaskRepositoryQuery): Promise<WorkTaskRecord[]>;
  count(query?: WorkTaskRepositoryQuery): Promise<number>;
  clear(): Promise<void>;
}

export const filterWorkTaskRecords = (
  records: WorkTaskRecord[],
  query: WorkTaskRepositoryQuery = {},
): WorkTaskRecord[] => {
  const statuses = query.status ? (Array.isArray(query.status) ? query.status : [query.status]) : null;
  const needle = query.search?.trim().toLocaleLowerCase('fa-IR');
  const offset = Math.max(0, query.offset ?? 0);
  const limit = query.limit == null ? Number.POSITIVE_INFINITY : Math.max(0, query.limit);

  return records
    .filter((task) => !query.from || task.dateJalali >= query.from)
    .filter((task) => !query.to || task.dateJalali <= query.to)
    .filter((task) => !statuses || statuses.includes(task.status))
    .filter((task) => !query.assignee || task.assignee === query.assignee)
    .filter((task) => !query.category || task.category === query.category)
    .filter((task) => !needle || [task.title, task.description, task.assignee, task.category, ...task.tags]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase('fa-IR').includes(needle)))
    .sort((a, b) => a.dateJalali.localeCompare(b.dateJalali) || (a.time ?? '99:99').localeCompare(b.time ?? '99:99') || a.id.localeCompare(b.id))
    .slice(offset, Number.isFinite(limit) ? offset + limit : undefined)
    .map((task) => ({ ...task, tags: [...task.tags] }));
};
