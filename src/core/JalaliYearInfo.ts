import { JalaliConverter } from './converter';

export interface JalaliYearInfo {
  year: number;
  isLeap: boolean;
  leapStatusFa: 'کبیسه' | 'عادی';
  daysInYear: 365 | 366;
  esfandDays: 29 | 30;
  farvardin1GregorianISO: string;
  lastDayGregorianISO: string;
}

/**
 * اطلاعات یک سال شمسی را مستقیماً از الگوریتم تقویم جلالی محاسبه می‌کند.
 * هیچ جدول دستی سال‌های کبیسه در این لایه وجود ندارد.
 */
export function getJalaliYearInfo(year: number): JalaliYearInfo {
  const isLeap = JalaliConverter.isLeapYear(year);
  const esfandDays = (isLeap ? 30 : 29) as 29 | 30;

  return {
    year,
    isLeap,
    leapStatusFa: isLeap ? 'کبیسه' : 'عادی',
    daysInYear: isLeap ? 366 : 365,
    esfandDays,
    farvardin1GregorianISO: JalaliConverter.toGregorianISO({ year, month: 1, day: 1 }),
    lastDayGregorianISO: JalaliConverter.toGregorianISO({ year, month: 12, day: esfandDays }),
  };
}

export class JalaliYearEngine {
  static get(year: number): JalaliYearInfo {
    return getJalaliYearInfo(year);
  }

  static isLeap(year: number): boolean {
    return JalaliConverter.isLeapYear(year);
  }

  static daysInYear(year: number): 365 | 366 {
    return JalaliConverter.isLeapYear(year) ? 366 : 365;
  }

  static esfandDays(year: number): 29 | 30 {
    return JalaliConverter.isLeapYear(year) ? 30 : 29;
  }
}
