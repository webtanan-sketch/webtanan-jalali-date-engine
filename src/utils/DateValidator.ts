import { JalaliConverter } from '../core/converter';

export class DateValidator {
  static validate(year: number, month: number, day: number): boolean {
    return JalaliConverter.isValid({ year, month, day });
  }

  static assert(year: number, month: number, day: number): void {
    if (!this.validate(year, month, day)) {
      throw new RangeError('تاریخ شمسی نامعتبر است.');
    }
  }
}
