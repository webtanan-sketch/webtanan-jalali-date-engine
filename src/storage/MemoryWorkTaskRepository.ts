import type { WorkTaskRecord } from '../work/WorkTask';
import { filterWorkTaskRecords, type WorkTaskRepository, type WorkTaskRepositoryQuery } from './WorkTaskRepository';

export class MemoryWorkTaskRepository implements WorkTaskRepository {
  private readonly records = new Map<string, WorkTaskRecord>();

  async upsert(task: WorkTaskRecord): Promise<void> {
    this.records.set(task.id, { ...task, tags: [...task.tags] });
  }

  async upsertMany(tasks: WorkTaskRecord[]): Promise<void> {
    tasks.forEach((task) => this.records.set(task.id, { ...task, tags: [...task.tags] }));
  }

  async get(id: string): Promise<WorkTaskRecord | null> {
    const task = this.records.get(id);
    return task ? { ...task, tags: [...task.tags] } : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }

  async query(query: WorkTaskRepositoryQuery = {}): Promise<WorkTaskRecord[]> {
    return filterWorkTaskRecords([...this.records.values()], query);
  }

  async count(query: WorkTaskRepositoryQuery = {}): Promise<number> {
    return filterWorkTaskRecords([...this.records.values()], { ...query, limit: undefined, offset: undefined }).length;
  }

  async clear(): Promise<void> {
    this.records.clear();
  }
}
