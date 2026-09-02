import { JalaliConverter } from '../../core/converter';
import type { Holiday, HolidayProvider } from '../HolidayEngine';

export interface HolidayDatasetSource {
  title: string;
  url?: string;
  verifiedAt: string;
}

export interface AnnualHolidayDatasetPayload {
  schemaVersion: 1;
  year: number;
  source: HolidayDatasetSource;
  holidays: Holiday[];
}

const parseYear = (date: string): number => {
  const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(date);
  if (!match) throw new Error(`فرمت تاریخ دیتاست نامعتبر است: ${date}`);
  const value = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!JalaliConverter.isValid(value)) throw new Error(`تاریخ دیتاست نامعتبر است: ${date}`);
  return value.year;
};

export class AnnualHolidayDataset implements HolidayProvider {
  readonly name: string;
  readonly version = '1';
  readonly year: number;
  readonly source: HolidayDatasetSource;
  private readonly holidays: Holiday[];

  constructor(payload: AnnualHolidayDatasetPayload) {
    if (payload.schemaVersion !== 1) throw new Error('نسخه دیتاست تعطیلات پشتیبانی نمی‌شود.');
    if (!Number.isInteger(payload.year) || payload.year < 1) throw new Error('سال دیتاست تعطیلات نامعتبر است.');
    if (!payload.source?.title || !payload.source?.verifiedAt) throw new Error('منبع و تاریخ تأیید دیتاست الزامی است.');

    const seen = new Set<string>();
    this.holidays = payload.holidays.map((holiday) => {
      if (parseYear(holiday.date) !== payload.year) {
        throw new Error(`تاریخ ${holiday.date} خارج از سال دیتاست ${payload.year} است.`);
      }
      const key = `${holiday.date}|${holiday.title}|${holiday.type}`;
      if (seen.has(key)) throw new Error(`تعطیلی تکراری در دیتاست: ${holiday.date} — ${holiday.title}`);
      seen.add(key);
      return { ...holiday };
    });

    this.year = payload.year;
    this.source = { ...payload.source };
    this.name = `iran-annual-${payload.year}`;
  }

  getHolidays(year: number): Holiday[] {
    if (year !== this.year) return [];
    return this.holidays.map((holiday) => ({ ...holiday }));
  }

  toJSON(): AnnualHolidayDatasetPayload {
    return {
      schemaVersion: 1,
      year: this.year,
      source: { ...this.source },
      holidays: this.getHolidays(this.year),
    };
  }

  static fromJSON(value: string): AnnualHolidayDataset {
    let payload: unknown;
    try {
      payload = JSON.parse(value);
    } catch {
      throw new Error('JSON دیتاست تعطیلات نامعتبر است.');
    }
    return new AnnualHolidayDataset(payload as AnnualHolidayDatasetPayload);
  }
}
