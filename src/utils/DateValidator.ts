import { JalaliConverter, type JalaliDateValue } from '../core/converter';
import { toEnglishDigits } from './PersianDigits';

export class DateValidator {
  static validate(year: number, month: number, day: number): boolean {
    return JalaliConverter.isValid({ year, month, day });
  }

  static assert(year: number, month: number, day: number): void {
    if (!this.validate(year, month, day)) {
      throw new RangeError('تاریخ شمسی نامعتبر است.');
    }
  }

  static parse(value: string): JalaliDateValue | null {
    if (typeof value !== 'string') return null;
    const normalizedDigits = toEnglishDigits(value).trim();
    const match = /^(\d{1,4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(normalizedDigits);
    if (!match) return null;
    const date = {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
    return JalaliConverter.isValid(date) ? date : null;
  }

  static normalize(value: string): string | null {
    const parsed = this.parse(value);
    return parsed ? JalaliConverter.format(parsed) : null;
  }

  static assertString(value: string): string {
    const normalized = this.normalize(value);
    if (!normalized) throw new RangeError('تاریخ شمسی نامعتبر است.');
    return normalized;
  }

  static toGregorianISO(value: string): string {
    const parsed = this.parse(value);
    if (!parsed) throw new RangeError('تاریخ شمسی نامعتبر است.');
    return JalaliConverter.toGregorianISO(parsed);
  }

  static compare(left: string, right: string): number {
    const a = this.assertString(left);
    const b = this.assertString(right);
    return a === b ? 0 : a < b ? -1 : 1;
  }
}
