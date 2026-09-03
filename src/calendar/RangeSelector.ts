import { JalaliConverter } from '../core/converter';
import { DateValidator } from '../utils/DateValidator';

export interface JalaliRange {
  start: string | null;
  end: string | null;
}

export interface CompleteJalaliRange {
  start: string;
  end: string;
}

export interface RangeSelectorOptions {
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  maxDays?: number;
}

const dayNumber = (value: string): number => {
  const parsed = DateValidator.parse(value);
  if (!parsed) throw new RangeError('تاریخ شمسی نامعتبر است.');
  const gregorian = JalaliConverter.toGregorian(parsed);
  return Math.floor(Date.UTC(gregorian.year, gregorian.month - 1, gregorian.day) / 86400000);
};

export class RangeSelector {
  private range: JalaliRange = { start: null, end: null };
  private minDate?: string;
  private maxDate?: string;
  private disabledDates = new Set<string>();
  private maxDays?: number;

  constructor(options: RangeSelectorOptions = {}) {
    this.minDate = options.minDate ? DateValidator.assertString(options.minDate) : undefined;
    this.maxDate = options.maxDate ? DateValidator.assertString(options.maxDate) : undefined;
    if (this.minDate && this.maxDate && this.minDate > this.maxDate) throw new RangeError('محدوده تاریخ نامعتبر است.');
    if (options.maxDays !== undefined && (!Number.isInteger(options.maxDays) || options.maxDays < 1)) {
      throw new RangeError('maxDays باید عدد صحیح بزرگ‌تر از صفر باشد.');
    }
    this.maxDays = options.maxDays;
    this.disabledDates = new Set((options.disabledDates ?? []).map((date) => DateValidator.assertString(date)));
  }

  setStart(date: string): void {
    const normalized = this.assertAllowed(date);
    this.range = { start: normalized, end: null };
  }

  setEnd(date: string): void {
    if (!this.range.start) throw new Error('ابتدا تاریخ شروع را انتخاب کنید.');
    const normalized = this.assertAllowed(date);
    if (normalized < this.range.start) throw new RangeError('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
    this.assertNoDisabledInside(this.range.start, normalized);
    this.assertDuration(this.range.start, normalized);
    this.range.end = normalized;
  }

  setRange(start: string, end: string): void {
    const normalizedStart = this.assertAllowed(start);
    const normalizedEnd = this.assertAllowed(end);
    if (normalizedEnd < normalizedStart) throw new RangeError('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
    this.assertNoDisabledInside(normalizedStart, normalizedEnd);
    this.assertDuration(normalizedStart, normalizedEnd);
    this.range = { start: normalizedStart, end: normalizedEnd };
  }

  getRange(): JalaliRange {
    return { ...this.range };
  }

  getCompleteRange(): CompleteJalaliRange | null {
    return this.range.start && this.range.end ? { start: this.range.start, end: this.range.end } : null;
  }

  isComplete(): boolean {
    return Boolean(this.range.start && this.range.end);
  }

  getDurationDays(inclusive = true): number | null {
    if (!this.range.start || !this.range.end) return null;
    const difference = dayNumber(this.range.end) - dayNumber(this.range.start);
    return inclusive ? difference + 1 : difference;
  }

  contains(date: string): boolean {
    if (!this.range.start || !this.range.end) return false;
    const normalized = DateValidator.assertString(date);
    return normalized >= this.range.start && normalized <= this.range.end;
  }

  setDisabledDates(dates: string[]): void {
    this.disabledDates = new Set(dates.map((date) => DateValidator.assertString(date)));
    if (this.range.start && this.range.end) {
      try {
        this.assertNoDisabledInside(this.range.start, this.range.end);
      } catch {
        this.clear();
      }
    }
  }

  clear(): void {
    this.range = { start: null, end: null };
  }

  private assertAllowed(value: string): string {
    const date = DateValidator.assertString(value);
    if (this.minDate && date < this.minDate) throw new RangeError('تاریخ خارج از حداقل مجاز است.');
    if (this.maxDate && date > this.maxDate) throw new RangeError('تاریخ خارج از حداکثر مجاز است.');
    if (this.disabledDates.has(date)) throw new RangeError('تاریخ انتخابی غیرفعال است.');
    return date;
  }

  private assertNoDisabledInside(start: string, end: string): void {
    for (const date of this.disabledDates) {
      if (date >= start && date <= end) throw new RangeError(`بازه شامل تاریخ غیرفعال ${date} است.`);
    }
  }

  private assertDuration(start: string, end: string): void {
    if (!this.maxDays) return;
    const duration = dayNumber(end) - dayNumber(start) + 1;
    if (duration > this.maxDays) throw new RangeError(`طول بازه بیشتر از ${this.maxDays} روز است.`);
  }
}
