import { DateValidator } from '../utils/DateValidator';

export type DayStatus = 'free' | 'work' | 'meeting' | 'holiday' | 'closed';

export interface DayStatusRecord {
  date: string;
  status: DayStatus;
  title?: string;
  description?: string;
  user?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayStatusInput {
  date: string;
  status: DayStatus;
  title?: string;
  description?: string;
  user?: string;
}

const clone = (record: DayStatusRecord): DayStatusRecord => ({ ...record });

export class DayStatusEngine {
  private statuses = new Map<string, DayStatusRecord>();

  set(date: string, status: DayStatus): DayStatusRecord;
  set(input: DayStatusInput): DayStatusRecord;
  set(dateOrInput: string | DayStatusInput, statusArg?: DayStatus): DayStatusRecord {
    const input: DayStatusInput = typeof dateOrInput === 'string'
      ? { date: dateOrInput, status: statusArg as DayStatus }
      : dateOrInput;

    if (!input.status) throw new Error('وضعیت روز الزامی است.');
    const date = DateValidator.assertString(input.date);
    const now = new Date().toISOString();
    const previous = this.statuses.get(date);
    const record: DayStatusRecord = {
      date,
      status: input.status,
      title: input.title?.trim() || undefined,
      description: input.description?.trim() || undefined,
      user: input.user?.trim() || undefined,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    this.statuses.set(date, record);
    return clone(record);
  }

  setMany(items: DayStatusInput[]): DayStatusRecord[] {
    return items.map((item) => this.set(item));
  }

  get(date: string): DayStatus {
    return this.statuses.get(DateValidator.assertString(date))?.status ?? 'free';
  }

  getRecord(date: string): DayStatusRecord | null {
    const record = this.statuses.get(DateValidator.assertString(date));
    return record ? clone(record) : null;
  }

  getByStatus(status: DayStatus): DayStatusRecord[] {
    return this.list().filter((record) => record.status === status);
  }

  list(): DayStatusRecord[] {
    return [...this.statuses.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(clone);
  }

  clear(date: string): boolean {
    return this.statuses.delete(DateValidator.assertString(date));
  }

  clearByStatus(status: DayStatus): number {
    let removed = 0;
    for (const [date, record] of this.statuses.entries()) {
      if (record.status === status) {
        this.statuses.delete(date);
        removed += 1;
      }
    }
    return removed;
  }

  clearAll(): void {
    this.statuses.clear();
  }

  toJSON(): DayStatusRecord[] {
    return this.list();
  }
}
