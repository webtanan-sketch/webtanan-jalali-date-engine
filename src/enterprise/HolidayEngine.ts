import { JalaliConverter } from '../core/converter';

export type HolidayType = 'official' | 'company';
export type HolidaySource = 'fixed-solar' | 'movable' | 'annual-dataset' | 'company' | 'custom';

export interface Holiday {
  date: string;
  title: string;
  type: HolidayType;
  source?: HolidaySource;
  id?: string;
  description?: string;
}

export interface HolidayProvider {
  readonly name: string;
  readonly version: string;
  getHolidays(year: number): Holiday[];
}

const normalizeDate = (value: string): string => {
  const match = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت تاریخ تعطیلی باید مانند 1405/01/01 باشد.');

  const date = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };

  if (!JalaliConverter.isValid(date)) {
    throw new RangeError(`تاریخ تعطیلی نامعتبر است: ${value}`);
  }

  return JalaliConverter.format(date);
};

const holidayKey = (holiday: Holiday): string =>
  holiday.id ?? `${holiday.date}|${holiday.type}|${holiday.title}`;

export class HolidayEngine {
  private holidays = new Map<string, Holiday[]>();

  add(holiday: Holiday): void {
    const normalized: Holiday = {
      ...holiday,
      date: normalizeDate(holiday.date),
      title: holiday.title.trim(),
    };

    if (!normalized.title) throw new RangeError('عنوان تعطیلی نمی‌تواند خالی باشد.');

    const current = this.holidays.get(normalized.date) ?? [];
    const key = holidayKey(normalized);
    if (!current.some((item) => holidayKey(item) === key)) {
      current.push(normalized);
      this.holidays.set(normalized.date, current);
    }
  }

  addMany(holidays: Holiday[]): void {
    holidays.forEach((holiday) => this.add(holiday));
  }

  load(provider: HolidayProvider, year: number): number {
    if (!Number.isInteger(year) || year < 1) throw new RangeError('سال شمسی نامعتبر است.');
    const items = provider.getHolidays(year);
    this.addMany(items);
    return items.length;
  }

  isHoliday(date: string): boolean {
    return (this.holidays.get(normalizeDate(date))?.length ?? 0) > 0;
  }

  get(date: string): Holiday[] {
    return [...(this.holidays.get(normalizeDate(date)) ?? [])];
  }

  getAll(): Holiday[] {
    return [...this.holidays.values()]
      .flat()
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  remove(date: string, predicate?: (holiday: Holiday) => boolean): number {
    const normalized = normalizeDate(date);
    const current = this.holidays.get(normalized) ?? [];
    if (!current.length) return 0;

    if (!predicate) {
      this.holidays.delete(normalized);
      return current.length;
    }

    const kept = current.filter((holiday) => !predicate(holiday));
    const removed = current.length - kept.length;
    if (kept.length) this.holidays.set(normalized, kept);
    else this.holidays.delete(normalized);
    return removed;
  }

  clear(): void {
    this.holidays.clear();
  }
}
