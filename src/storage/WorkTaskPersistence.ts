import type { WorkTaskInput, WorkTaskRecord } from '../work/WorkTask';
import { WorkTaskManager } from '../work/WorkTaskManager';
import type { WorkTaskRepository, WorkTaskRepositoryQuery } from './WorkTaskRepository';

export class WorkTaskPersistence {
  constructor(
    private readonly manager: WorkTaskManager,
    private readonly repository: WorkTaskRepository,
  ) {}

  async install(): Promise<void> {
    await this.repository.install?.();
  }

  async load(query: WorkTaskRepositoryQuery = {}, replace = true): Promise<WorkTaskRecord[]> {
    const records = await this.repository.query(query);
    return this.manager.importRecords(records, replace);
  }

  async saveAll(): Promise<number> {
    const records = this.manager.toJSON();
    await this.repository.upsertMany(records);
    return records.length;
  }

  async add(input: WorkTaskInput): Promise<WorkTaskRecord> {
    const task = this.manager.add(input);
    try {
      await this.repository.upsert(task);
      return task;
    } catch (error) {
      this.manager.remove(task.id);
      throw error;
    }
  }

  async update(id: string, patch: Partial<WorkTaskInput>): Promise<WorkTaskRecord> {
    const previous = this.manager.get(id);
    if (!previous) throw new Error('کار موردنظر پیدا نشد.');
    const next = this.manager.update(id, patch);
    try {
      await this.repository.upsert(next);
      return next;
    } catch (error) {
      this.manager.importRecords([previous], false);
      throw error;
    }
  }

  async toggleDone(id: string): Promise<WorkTaskRecord> {
    const previous = this.manager.get(id);
    if (!previous) throw new Error('کار موردنظر پیدا نشد.');
    const next = this.manager.toggleDone(id);
    try {
      await this.repository.upsert(next);
      return next;
    } catch (error) {
      this.manager.importRecords([previous], false);
      throw error;
    }
  }

  async remove(id: string): Promise<boolean> {
    const previous = this.manager.get(id);
    if (!previous) return false;
    const removedLocally = this.manager.remove(id);
    if (!removedLocally) return false;
    try {
      const removedRemote = await this.repository.delete(id);
      if (!removedRemote) {
        this.manager.importRecords([previous], false);
        return false;
      }
      return true;
    } catch (error) {
      this.manager.importRecords([previous], false);
      throw error;
    }
  }

  getManager(): WorkTaskManager {
    return this.manager;
  }

  getRepository(): WorkTaskRepository {
    return this.repository;
  }
}
