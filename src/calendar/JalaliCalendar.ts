import { JalaliConverter } from '../core/converter';

export class JalaliCalendar {
  private year: number;
  private month: number;

  constructor(year: number, month: number) {
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      throw new RangeError('سال یا ماه شمسی نامعتبر است.');
    }
    this.year = year;
    this.month = month;
  }

  getDaysInMonth(): number {
    return JalaliConverter.daysInMonth(this.year, this.month);
  }

  isLeapYear(): boolean {
    return JalaliConverter.isLeapYear(this.year);
  }

  getMonthName(): string {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    return months[this.month - 1];
  }

  getInfo() {
    return {
      year: this.year,
      month: this.month,
      name: this.getMonthName(),
      days: this.getDaysInMonth(),
      leapYear: this.isLeapYear(),
    };
  }
}
