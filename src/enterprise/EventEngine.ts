import { JalaliConverter } from '../core/converter';

export type EventType = 'call' | 'meeting' | 'delivery' | 'payment' | 'followup';

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: EventType;
  user?: string;
  description?: string;
  time?: string;
  gregorianDate?: string;
  createdAt?: string;
}

export interface CalendarEventRecord extends CalendarEvent {
  gregorianDate: string;
  createdAt: string;
}

const parseJalali = (value: string) => {
  const match = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت تاریخ رویداد نامعتبر است.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!JalaliConverter.isValid(date)) throw new RangeError('تاریخ شمسی رویداد نامعتبر است.');
  return date;
};

const normalizeTime = (value?: string): string | undefined => {
  if (!value) return undefined;
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت ساعت باید HH:mm یا HH:mm:ss باشد.');
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
  if (hour > 23 || minute > 59 || second > 59) throw new RangeError('ساعت رویداد نامعتبر است.');
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}${match[3] ? `:${String(second).padStart(2, '0')}` : ''}`;
};

const clone = (event: CalendarEventRecord): CalendarEventRecord => ({ ...event });

export class EventEngine {
  private events = new Map<string, CalendarEventRecord>();

  add(event: CalendarEvent): CalendarEventRecord {
    const id = event.id.trim();
    if (!id) throw new Error('شناسه رویداد الزامی است.');
    if (this.events.has(id)) throw new Error('رویدادی با این شناسه قبلاً ثبت شده است.');
    if (!event.title.trim()) throw new Error('عنوان رویداد الزامی است.');

    const jalali = parseJalali(event.date);
    const record: CalendarEventRecord = {
      ...event,
      id,
      date: JalaliConverter.format(jalali),
      title: event.title.trim(),
      time: normalizeTime(event.time),
      gregorianDate: JalaliConverter.toGregorianISO(jalali),
      createdAt: event.createdAt ?? new Date().toISOString(),
    };
    this.events.set(id, record);
    return clone(record);
  }

  update(id: string, patch: Partial<Omit<CalendarEvent, 'id'>>): CalendarEventRecord {
    const current = this.events.get(id);
    if (!current) throw new Error('رویداد پیدا نشد.');

    let date = current.date;
    let gregorianDate = current.gregorianDate;
    if (patch.date !== undefined) {
      const jalali = parseJalali(patch.date);
      date = JalaliConverter.format(jalali);
      gregorianDate = JalaliConverter.toGregorianISO(jalali);
    }

    const next: CalendarEventRecord = {
      ...current,
      ...patch,
      id,
      date,
      gregorianDate,
      title: patch.title !== undefined ? patch.title.trim() : current.title,
      time: patch.time !== undefined ? normalizeTime(patch.time) : current.time,
      createdAt: current.createdAt,
    };
    if (!next.title) throw new Error('عنوان رویداد الزامی است.');
    this.events.set(id, next);
    return clone(next);
  }

  getById(id: string): CalendarEventRecord | null {
    const item = this.events.get(id);
    return item ? clone(item) : null;
  }

  getByDate(date: string): CalendarEventRecord[] {
    const normalized = JalaliConverter.format(parseJalali(date));
    return [...this.events.values()]
      .filter((item) => item.date === normalized)
      .map(clone);
  }

  list(): CalendarEventRecord[] {
    return [...this.events.values()]
      .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))
      .map(clone);
  }

  remove(id: string): boolean {
    return this.events.delete(id);
  }

  clear(): void {
    this.events.clear();
  }

  toJSON(): CalendarEventRecord[] {
    return this.list();
  }
}
