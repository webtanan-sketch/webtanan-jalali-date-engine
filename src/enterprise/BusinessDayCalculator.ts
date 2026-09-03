import { JalaliConverter, type JalaliDateValue } from '../core/converter';
import { DateValidator } from '../utils/DateValidator';
import { DayStatusEngine } from './DayStatusEngine';
import { HolidayEngine } from './HolidayEngine';

export type GregorianWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface BusinessDayCalculatorOptions {
  holidays?: HolidayEngine | null;
  dayStatuses?: DayStatusEngine | null;
  /** روزهای تعطیل هفتگی بر اساس getUTCDay: یکشنبه=0 ... جمعه=5، شنبه=6 */
  weekendDays?: GregorianWeekday[];
}

const addCalendarDays = (date: JalaliDateValue, amount: number): JalaliDateValue => {
  const gregorian = JalaliConverter.toGregorian(date);
  const timestamp = Date.UTC(gregorian.year, gregorian.month - 1, gregorian.day + amount);
  const shifted = new Date(timestamp);
  return JalaliConverter.toJalali({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
};

const weekdayOf = (date: JalaliDateValue): GregorianWeekday => {
  const gregorian = JalaliConverter.toGregorian(date);
  return new Date(Date.UTC(gregorian.year, gregorian.month - 1, gregorian.day)).getUTCDay() as GregorianWeekday;
};

export class BusinessDayCalculator {
  private holidays: HolidayEngine | null;
  private dayStatuses: DayStatusEngine | null;
  private weekendDays: Set<GregorianWeekday>;

  constructor(options: BusinessDayCalculatorOptions = {}) {
    this.holidays = options.holidays ?? null;
    this.dayStatuses = options.dayStatuses ?? null;
    this.weekendDays = new Set(options.weekendDays ?? [5]);
  }

  setHolidayEngine(engine: HolidayEngine | null): void {
    this.holidays = engine;
  }

  setDayStatusEngine(engine: DayStatusEngine | null): void {
    this.dayStatuses = engine;
  }

  setWeekendDays(days: GregorianWeekday[]): void {
    this.weekendDays = new Set(days);
  }

  isBusinessDay(value: string): boolean {
    const normalized = DateValidator.assertString(value);
    const parsed = DateValidator.parse(normalized) as JalaliDateValue;
    if (this.weekendDays.has(weekdayOf(parsed))) return false;
    if (this.holidays?.isHoliday(normalized)) return false;
    const status = this.dayStatuses?.get(normalized) ?? 'free';
    return status !== 'holiday' && status !== 'closed';
  }

  nextBusinessDay(value: string, includeCurrent = false): string {
    const normalized = DateValidator.assertString(value);
    let cursor = DateValidator.parse(normalized) as JalaliDateValue;
    if (includeCurrent && this.isBusinessDay(normalized)) return normalized;

    for (let guard = 0; guard < 370; guard += 1) {
      cursor = addCalendarDays(cursor, 1);
      const candidate = JalaliConverter.format(cursor);
      if (this.isBusinessDay(candidate)) return candidate;
    }
    throw new Error('روز کاری بعدی در محدوده جستجو پیدا نشد.');
  }

  previousBusinessDay(value: string, includeCurrent = false): string {
    const normalized = DateValidator.assertString(value);
    let cursor = DateValidator.parse(normalized) as JalaliDateValue;
    if (includeCurrent && this.isBusinessDay(normalized)) return normalized;

    for (let guard = 0; guard < 370; guard += 1) {
      cursor = addCalendarDays(cursor, -1);
      const candidate = JalaliConverter.format(cursor);
      if (this.isBusinessDay(candidate)) return candidate;
    }
    throw new Error('روز کاری قبلی در محدوده جستجو پیدا نشد.');
  }

  addBusinessDays(value: string, amount: number): string {
    if (!Number.isInteger(amount)) throw new TypeError('تعداد روز کاری باید عدد صحیح باشد.');
    let result = DateValidator.assertString(value);
    const direction = amount >= 0 ? 1 : -1;
    let remaining = Math.abs(amount);
    while (remaining > 0) {
      result = direction > 0
        ? this.nextBusinessDay(result)
        : this.previousBusinessDay(result);
      remaining -= 1;
    }
    return result;
  }

  countBusinessDays(start: string, end: string, inclusive = true): number {
    const from = DateValidator.assertString(start);
    const to = DateValidator.assertString(end);
    if (from > to) throw new RangeError('تاریخ شروع نباید بعد از تاریخ پایان باشد.');

    let cursor = DateValidator.parse(from) as JalaliDateValue;
    let count = 0;
    while (true) {
      const value = JalaliConverter.format(cursor);
      const boundaryAllowed = inclusive || (value !== from && value !== to);
      if (boundaryAllowed && this.isBusinessDay(value)) count += 1;
      if (value === to) break;
      cursor = addCalendarDays(cursor, 1);
    }
    return count;
  }
}
