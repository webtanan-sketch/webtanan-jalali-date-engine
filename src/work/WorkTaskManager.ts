import { createWorkTask, updateWorkTask, type WorkTaskInput, type WorkTaskRecord, type WorkTaskStatus } from './WorkTask';

export interface WorkTaskQuery {
  from?: string;
  to?: string;
  status?: WorkTaskStatus | WorkTaskStatus[];
  assignee?: string;
  category?: string;
  search?: string;
}

export class WorkTaskManager {
  private readonly tasks = new Map<string, WorkTaskRecord>();

  add(input: WorkTaskInput): WorkTaskRecord {
    const task = createWorkTask(input);
    if (this.tasks.has(task.id)) throw new Error(`کار با شناسه ${task.id} قبلاً ثبت شده است.`);
    this.tasks.set(task.id, task);
    return { ...task, tags: [...task.tags] };
  }

  addMany(inputs: WorkTaskInput[]): WorkTaskRecord[] {
    return inputs.map((input) => this.add(input));
  }

  update(id: string, patch: Partial<WorkTaskInput>): WorkTaskRecord {
    const current = this.tasks.get(id);
    if (!current) throw new Error('کار موردنظر پیدا نشد.');
    const next = updateWorkTask(current, patch);
    this.tasks.set(id, next);
    return { ...next, tags: [...next.tags] };
  }

  toggleDone(id: string): WorkTaskRecord {
    const current = this.tasks.get(id);
    if (!current) throw new Error('کار موردنظر پیدا نشد.');
    return this.update(id, { status: current.status === 'done' ? 'todo' : 'done' });
  }

  remove(id: string): boolean {
    return this.tasks.delete(id);
  }

  get(id: string): WorkTaskRecord | null {
    const task = this.tasks.get(id);
    return task ? { ...task, tags: [...task.tags] } : null;
  }

  getByDate(date: string): WorkTaskRecord[] {
    return this.query({ from: date, to: date });
  }

  query(query: WorkTaskQuery = {}): WorkTaskRecord[] {
    const statuses = query.status ? (Array.isArray(query.status) ? query.status : [query.status]) : null;
    const needle = query.search?.trim().toLocaleLowerCase('fa-IR');

    return [...this.tasks.values()]
      .filter((task) => !query.from || task.dateJalali >= query.from)
      .filter((task) => !query.to || task.dateJalali <= query.to)
      .filter((task) => !statuses || statuses.includes(task.status))
      .filter((task) => !query.assignee || task.assignee === query.assignee)
      .filter((task) => !query.category || task.category === query.category)
      .filter((task) => !needle || [task.title, task.description, task.assignee, task.category, ...task.tags]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase('fa-IR').includes(needle)))
      .sort((a, b) => {
        const byDate = a.dateJalali.localeCompare(b.dateJalali);
        if (byDate !== 0) return byDate;
        const byTime = (a.time ?? '99:99').localeCompare(b.time ?? '99:99');
        if (byTime !== 0) return byTime;
        return a.createdAt.localeCompare(b.createdAt);
      })
      .map((task) => ({ ...task, tags: [...task.tags] }));
  }

  getOverdue(today: string): WorkTaskRecord[] {
    return this.query({ to: today }).filter((task) => task.dateJalali < today && task.status !== 'done' && task.status !== 'cancelled');
  }

  countByDate(date: string): number {
    return this.getByDate(date).length;
  }

  clear(): void {
    this.tasks.clear();
  }

  toJSON(): WorkTaskRecord[] {
    return this.query();
  }
}
