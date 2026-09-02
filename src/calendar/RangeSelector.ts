import { JalaliConverter } from '../core/converter';

export interface JalaliRange {
  start: string | null;
  end: string | null;
}

const normalize = (value: string): string => {
  const match = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت تاریخ باید مانند 1405/06/11 باشد.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!JalaliConverter.isValid(date)) throw new RangeError('تاریخ شمسی نامعتبر است.');
  return JalaliConverter.format(date);
};

export class RangeSelector {
  private range: JalaliRange = { start: null, end: null };

  setStart(date: string): void {
    this.range = { start: normalize(date), end: null };
  }

  setEnd(date: string): void {
    if (!this.range.start) throw new Error('ابتدا تاریخ شروع را انتخاب کنید.');
    const normalized = normalize(date);
    if (normalized < this.range.start) throw new RangeError('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
    this.range.end = normalized;
  }

  setRange(start: string, end: string): void {
    this.setStart(start);
    this.setEnd(end);
  }

  getRange(): JalaliRange {
    return { ...this.range };
  }

  clear(): void {
    this.range = { start: null, end: null };
  }
}
