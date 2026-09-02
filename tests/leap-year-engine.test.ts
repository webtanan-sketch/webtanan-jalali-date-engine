import { JalaliConverter } from '../src/core/converter';
import { JalaliYearEngine, getJalaliYearInfo } from '../src/core/JalaliYearInfo';

describe('Jalali leap-year engine — الگوریتم عمومی کبیسه', () => {
  test('سال ۱۳۶۰ از خود الگوریتم محاسبه می‌شود و سال عادی است', () => {
    const info = getJalaliYearInfo(1360);

    expect(info).toEqual({
      year: 1360,
      isLeap: false,
      leapStatusFa: 'عادی',
      daysInYear: 365,
      esfandDays: 29,
      farvardin1GregorianISO: '1981-03-21',
      lastDayGregorianISO: '1982-03-20',
    });
    expect(JalaliConverter.isValid({ year: 1360, month: 12, day: 30 })).toBe(false);
  });

  test('سال‌های قدیمی کبیسه نیز بدون جدول دستی تشخیص داده می‌شوند', () => {
    expect(JalaliYearEngine.isLeap(1358)).toBe(true);
    expect(JalaliYearEngine.isLeap(1360)).toBe(false);
    expect(JalaliYearEngine.isLeap(1362)).toBe(true);
    expect(JalaliYearEngine.esfandDays(1358)).toBe(30);
    expect(JalaliYearEngine.esfandDays(1360)).toBe(29);
  });

  test('برای تمام محدوده پشتیبانی‌شده، اسفند و تعداد روز سال با کبیسه هماهنگ است', () => {
    const { min, max } = JalaliConverter.supportedYears;

    for (let year = min; year <= max; year += 1) {
      const leap = JalaliConverter.isLeapYear(year);
      expect(JalaliConverter.daysInMonth(year, 12)).toBe(leap ? 30 : 29);
      expect(JalaliYearEngine.daysInYear(year)).toBe(leap ? 366 : 365);
      expect(JalaliConverter.isValid({ year, month: 12, day: leap ? 30 : 29 })).toBe(true);
      if (!leap) expect(JalaliConverter.isValid({ year, month: 12, day: 30 })).toBe(false);
    }
  });

  test('رفت‌وبرگشت مرز سال برای ۱۲۰۰ تا ۱۵۰۰ بدون خطا انجام می‌شود', () => {
    for (let year = 1200; year <= 1500; year += 1) {
      const esfandDay = JalaliConverter.isLeapYear(year) ? 30 : 29;
      const first = { year, month: 1, day: 1 };
      const last = { year, month: 12, day: esfandDay };

      expect(JalaliConverter.toJalali(JalaliConverter.toGregorian(first))).toEqual(first);
      expect(JalaliConverter.toJalali(JalaliConverter.toGregorian(last))).toEqual(last);
    }
  });

  test('سال خارج از محدوده پشتیبانی‌شده صریحاً رد می‌شود', () => {
    expect(() => JalaliYearEngine.isLeap(0)).toThrow('خارج از محدوده');
    expect(() => JalaliYearEngine.isLeap(3178)).toThrow('خارج از محدوده');
  });
});
