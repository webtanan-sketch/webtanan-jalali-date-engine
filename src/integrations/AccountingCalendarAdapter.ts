import { DateValidator } from '../utils/DateValidator';

export type AccountingEntryType =
  | 'invoice'
  | 'payment-due'
  | 'payment-received'
  | 'payroll'
  | 'tax'
  | 'period-closing';

export type AccountingEntryStatus = 'pending' | 'done' | 'cancelled';

export interface AccountingCalendarEntry {
  id: string;
  date: string;
  title: string;
  type: AccountingEntryType;
  status?: AccountingEntryStatus;
  amount?: number;
  reference?: string;
  user?: string;
  description?: string;
  time?: string;
  gregorianDate?: string;
  createdAt?: string;
}

export interface AccountingCalendarRecord extends AccountingCalendarEntry {
  date: string;
  status: AccountingEntryStatus;
  gregorianDate: string;
  createdAt: string;
}

const normalizeTime = (value?: string): string | undefined => {
  if (!value) return undefined;
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت ساعت حسابداری نامعتبر است.');
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
  if (hour > 23 || minute > 59 || second > 59) throw new RangeError('ساعت حسابداری نامعتبر است.');
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}${match[3] ? `:${String(second).padStart(2, '0')}` : ''}`;
};

const clone = (record: AccountingCalendarRecord): AccountingCalendarRecord => ({ ...record });

export class AccountingCalendarAdapter {
  private entries = new Map<string, AccountingCalendarRecord>();

  add(entry: AccountingCalendarEntry): AccountingCalendarRecord {
    const id = entry.id.trim();
    if (!id) throw new Error('شناسه رکورد حسابداری الزامی است.');
    if (this.entries.has(id)) throw new Error('رکورد حسابداری با این شناسه قبلاً ثبت شده است.');
    if (!entry.title.trim()) throw new Error('عنوان رکورد حسابداری الزامی است.');
    if (entry.amount !== undefined && (!Number.isFinite(entry.amount) || entry.amount < 0)) {
      throw new RangeError('مبلغ باید صفر یا بزرگ‌تر باشد.');
    }

    const date = DateValidator.assertString(entry.date);
    const record: AccountingCalendarRecord = {
      ...entry,
      id,
      date,
      title: entry.title.trim(),
      status: entry.status ?? 'pending',
      time: normalizeTime(entry.time),
      gregorianDate: DateValidator.toGregorianISO(date),
      createdAt: entry.createdAt ?? new Date().toISOString(),
    };
    this.entries.set(id, record);
    return clone(record);
  }

  update(id: string, patch: Partial<Omit<AccountingCalendarEntry, 'id'>>): AccountingCalendarRecord {
    const current = this.entries.get(id);
    if (!current) throw new Error('رکورد حسابداری پیدا نشد.');
    const date = patch.date !== undefined ? DateValidator.assertString(patch.date) : current.date;
    const amount = patch.amount !== undefined ? patch.amount : current.amount;
    if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
      throw new RangeError('مبلغ باید صفر یا بزرگ‌تر باشد.');
    }
    const next: AccountingCalendarRecord = {
      ...current,
      ...patch,
      id,
      date,
      title: patch.title !== undefined ? patch.title.trim() : current.title,
      status: patch.status ?? current.status,
      amount,
      time: patch.time !== undefined ? normalizeTime(patch.time) : current.time,
      gregorianDate: DateValidator.toGregorianISO(date),
      createdAt: current.createdAt,
    };
    if (!next.title) throw new Error('عنوان رکورد حسابداری الزامی است.');
    this.entries.set(id, next);
    return clone(next);
  }

  getById(id: string): AccountingCalendarRecord | null {
    const item = this.entries.get(id);
    return item ? clone(item) : null;
  }

  getByDate(date: string): AccountingCalendarRecord[] {
    const normalized = DateValidator.assertString(date);
    return this.list().filter((entry) => entry.date === normalized);
  }

  getUpcoming(fromDate: string, toDate?: string): AccountingCalendarRecord[] {
    const from = DateValidator.assertString(fromDate);
    const to = toDate ? DateValidator.assertString(toDate) : null;
    if (to && from > to) throw new RangeError('بازه حسابداری نامعتبر است.');
    return this.list().filter((entry) => entry.date >= from && (!to || entry.date <= to));
  }

  getPendingDues(asOf?: string): AccountingCalendarRecord[] {
    const limit = asOf ? DateValidator.assertString(asOf) : null;
    return this.list().filter((entry) =>
      entry.type === 'payment-due'
      && entry.status === 'pending'
      && (!limit || entry.date <= limit),
    );
  }

  sum(type?: AccountingEntryType, status?: AccountingEntryStatus): number {
    return this.list()
      .filter((entry) => (!type || entry.type === type) && (!status || entry.status === status))
      .reduce((total, entry) => total + (entry.amount ?? 0), 0);
  }

  list(): AccountingCalendarRecord[] {
    return [...this.entries.values()]
      .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))
      .map(clone);
  }

  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  clear(): void {
    this.entries.clear();
  }
}
