import { JalaliConverter, type GregorianDateValue, type JalaliDateValue } from './converter';
import { getJalaliYearInfo, type JalaliYearInfo } from './JalaliYearInfo';

export type { JalaliDateValue, GregorianDateValue, JalaliYearInfo };

export class JalaliCore {
  static isValid(date: JalaliDateValue): boolean {
    return JalaliConverter.isValid(date);
  }

  static isLeapYear(year: number): boolean {
    return JalaliConverter.isLeapYear(year);
  }

  static getYearInfo(year: number): JalaliYearInfo {
    return getJalaliYearInfo(year);
  }

  static daysInYear(year: number): 365 | 366 {
    return JalaliConverter.isLeapYear(year) ? 366 : 365;
  }

  static daysInMonth(year: number, month: number): number {
    return JalaliConverter.daysInMonth(year, month);
  }

  static format(date: JalaliDateValue, separator = '/'): string {
    return JalaliConverter.format(date, separator);
  }

  static toGregorian(date: JalaliDateValue): GregorianDateValue {
    return JalaliConverter.toGregorian(date);
  }

  static toGregorianISO(date: JalaliDateValue): string {
    return JalaliConverter.toGregorianISO(date);
  }

  static toJalali(date: GregorianDateValue): JalaliDateValue {
    return JalaliConverter.toJalali(date);
  }
}
