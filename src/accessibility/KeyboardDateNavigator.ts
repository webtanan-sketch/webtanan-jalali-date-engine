import { JalaliConverter, type JalaliDateValue } from '../core/converter';

export type CalendarNavigationKey =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'PageUp'
  | 'PageDown'
  | 'Home'
  | 'End';

const clone = (date: JalaliDateValue): JalaliDateValue => ({ ...date });

export class KeyboardDateNavigator {
  static addDays(date: JalaliDateValue, days: number): JalaliDateValue {
    if (!JalaliConverter.isValid(date) || !Number.isInteger(days)) {
      throw new RangeError('تاریخ یا تعداد روز نامعتبر است.');
    }

    const gregorian = JalaliConverter.toGregorian(date);
    const value = new Date(Date.UTC(gregorian.year, gregorian.month - 1, gregorian.day));
    value.setUTCDate(value.getUTCDate() + days);
    return JalaliConverter.fromGregorianDate(value);
  }

  static addMonths(date: JalaliDateValue, months: number): JalaliDateValue {
    if (!JalaliConverter.isValid(date) || !Number.isInteger(months)) {
      throw new RangeError('تاریخ یا تعداد ماه نامعتبر است.');
    }

    const zeroBased = date.year * 12 + (date.month - 1) + months;
    const year = Math.floor(zeroBased / 12);
    const month = ((zeroBased % 12) + 12) % 12 + 1;
    const normalizedYear = zeroBased < 0 && zeroBased % 12 !== 0 ? year : year;
    const day = Math.min(date.day, JalaliConverter.daysInMonth(normalizedYear, month));
    return { year: normalizedYear, month, day };
  }

  static startOfMonth(date: JalaliDateValue): JalaliDateValue {
    if (!JalaliConverter.isValid(date)) throw new RangeError('تاریخ نامعتبر است.');
    return { year: date.year, month: date.month, day: 1 };
  }

  static endOfMonth(date: JalaliDateValue): JalaliDateValue {
    if (!JalaliConverter.isValid(date)) throw new RangeError('تاریخ نامعتبر است.');
    return { year: date.year, month: date.month, day: JalaliConverter.daysInMonth(date.year, date.month) };
  }

  static navigate(date: JalaliDateValue, key: CalendarNavigationKey, rtl = true): JalaliDateValue {
    switch (key) {
      case 'ArrowLeft':
        return this.addDays(date, rtl ? 1 : -1);
      case 'ArrowRight':
        return this.addDays(date, rtl ? -1 : 1);
      case 'ArrowUp':
        return this.addDays(date, -7);
      case 'ArrowDown':
        return this.addDays(date, 7);
      case 'PageUp':
        return this.addMonths(date, -1);
      case 'PageDown':
        return this.addMonths(date, 1);
      case 'Home':
        return this.startOfMonth(date);
      case 'End':
        return this.endOfMonth(date);
      default:
        return clone(date);
    }
  }
}
