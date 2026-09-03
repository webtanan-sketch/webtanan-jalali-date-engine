import { JalaliConverter } from '../core/converter';

export type WorkTaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type WorkTaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface WorkTaskInput {
  id?: string;
  date: string;
  title: string;
  time?: string;
  endTime?: string;
  status?: WorkTaskStatus;
  priority?: WorkTaskPriority;
  category?: string;
  assignee?: string;
  description?: string;
  color?: string;
  tags?: string[];
  createdBy?: string;
}

export interface WorkTaskRecord {
  id: string;
  dateJalali: string;
  dateGregorian: string;
  title: string;
  time?: string;
  endTime?: string;
  status: WorkTaskStatus;
  priority: WorkTaskPriority;
  category?: string;
  assignee?: string;
  description?: string;
  color?: string;
  tags: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const normalizeDate = (value: string): string => {
  const match = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت تاریخ کار باید مانند 1405/06/11 باشد.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!JalaliConverter.isValid(date)) throw new RangeError('تاریخ شمسی کار نامعتبر است.');
  return JalaliConverter.format(date);
};

const normalizeTime = (value?: string): string | undefined => {
  if (!value) return undefined;
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت ساعت باید HH:mm یا HH:mm:ss باشد.');
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
  if (hour > 23 || minute > 59 || second > 59) throw new RangeError('ساعت کار نامعتبر است.');
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}${match[3] ? `:${String(second).padStart(2, '0')}` : ''}`;
};

const makeId = (): string => {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const jalaliValueFromNormalized = (value: string): { year: number; month: number; day: number } => {
  const [year, month, day] = value.split('/').map(Number);
  return { year, month, day };
};

export function createWorkTask(input: WorkTaskInput, now = new Date()): WorkTaskRecord {
  const dateJalali = normalizeDate(input.date);
  const title = input.title.trim();
  if (!title) throw new RangeError('عنوان کار نمی‌تواند خالی باشد.');

  const time = normalizeTime(input.time);
  const endTime = normalizeTime(input.endTime);
  if (time && endTime && endTime < time) throw new RangeError('ساعت پایان نباید قبل از ساعت شروع باشد.');

  const timestamp = now.toISOString();
  return {
    id: input.id?.trim() || makeId(),
    dateJalali,
    dateGregorian: JalaliConverter.toGregorianISO(jalaliValueFromNormalized(dateJalali)),
    title,
    time,
    endTime,
    status: input.status ?? 'todo',
    priority: input.priority ?? 'normal',
    category: input.category?.trim() || undefined,
    assignee: input.assignee?.trim() || undefined,
    description: input.description?.trim() || undefined,
    color: input.color?.trim() || undefined,
    tags: [...new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean))],
    createdBy: input.createdBy?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: input.status === 'done' ? timestamp : undefined,
  };
}

export function updateWorkTask(record: WorkTaskRecord, patch: Partial<WorkTaskInput>, now = new Date()): WorkTaskRecord {
  const base: WorkTaskInput = {
    id: record.id,
    date: patch.date ?? record.dateJalali,
    title: patch.title ?? record.title,
    time: patch.time ?? record.time,
    endTime: patch.endTime ?? record.endTime,
    status: patch.status ?? record.status,
    priority: patch.priority ?? record.priority,
    category: patch.category ?? record.category,
    assignee: patch.assignee ?? record.assignee,
    description: patch.description ?? record.description,
    color: patch.color ?? record.color,
    tags: patch.tags ?? record.tags,
    createdBy: patch.createdBy ?? record.createdBy,
  };
  const next = createWorkTask(base, now);
  next.createdAt = record.createdAt;
  if (next.status === 'done') next.completedAt = record.completedAt ?? now.toISOString();
  else next.completedAt = undefined;
  return next;
}
