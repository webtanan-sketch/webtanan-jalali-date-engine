import { JalaliConverter } from '../src/core/converter';

describe('JalaliConverter', () => {
  test('۱۴۰۵/۰۱/۰۱ به 2026-03-21 تبدیل می‌شود', () => {
    expect(JalaliConverter.toGregorianISO({ year: 1405, month: 1, day: 1 })).toBe('2026-03-21');
  });

  test('2026-09-02 به ۱۴۰۵/۰۶/۱۱ تبدیل می‌شود', () => {
    expect(JalaliConverter.toJalali({ year: 2026, month: 9, day: 2 })).toEqual({
      year: 1405,
      month: 6,
      day: 11,
    });
  });

  test('مرز رسمی ۱۴۰۳ و ۱۴۰۴ درست محاسبه می‌شود', () => {
    expect(JalaliConverter.isLeapYear(1403)).toBe(true);
    expect(JalaliConverter.isLeapYear(1404)).toBe(false);
    expect(JalaliConverter.toGregorianISO({ year: 1403, month: 12, day: 30 })).toBe('2025-03-20');
    expect(JalaliConverter.toGregorianISO({ year: 1404, month: 1, day: 1 })).toBe('2025-03-21');
    expect(JalaliConverter.isValid({ year: 1404, month: 12, day: 30 })).toBe(false);
  });

  test('مرز رسمی ۱۴۰۴ و ۱۴۰۵ درست محاسبه می‌شود', () => {
    expect(JalaliConverter.toGregorianISO({ year: 1404, month: 12, day: 29 })).toBe('2026-03-20');
    expect(JalaliConverter.toGregorianISO({ year: 1405, month: 1, day: 1 })).toBe('2026-03-21');
    expect(JalaliConverter.toJalali({ year: 2026, month: 3, day: 20 })).toEqual({ year: 1404, month: 12, day: 29 });
    expect(JalaliConverter.toJalali({ year: 2026, month: 3, day: 21 })).toEqual({ year: 1405, month: 1, day: 1 });
  });

  test('۱۳۹۹/۱۲/۳۰ به 2021-03-20 تبدیل می‌شود', () => {
    expect(JalaliConverter.isLeapYear(1399)).toBe(true);
    expect(JalaliConverter.toGregorianISO({ year: 1399, month: 12, day: 30 })).toBe('2021-03-20');
  });

  test('رفت و برگشت تاریخ بدون تغییر انجام می‌شود', () => {
    const source = { year: 1405, month: 12, day: 15 };
    const gregorian = JalaliConverter.toGregorian(source);
    expect(JalaliConverter.toJalali(gregorian)).toEqual(source);
  });

  test('روز شمسی نامعتبر رد می‌شود', () => {
    expect(JalaliConverter.isValid({ year: 1405, month: 7, day: 31 })).toBe(false);
    expect(JalaliConverter.isValid({ year: 1404, month: 12, day: 30 })).toBe(false);
  });

  test('روز میلادی نامعتبر بر اساس ماه رد می‌شود', () => {
    expect(JalaliConverter.isValidGregorian({ year: 2026, month: 2, day: 29 })).toBe(false);
    expect(JalaliConverter.isValidGregorian({ year: 2028, month: 2, day: 29 })).toBe(true);
    expect(() => JalaliConverter.toJalali({ year: 2026, month: 2, day: 31 })).toThrow();
  });

  test('Date نامعتبر رد می‌شود', () => {
    expect(() => JalaliConverter.fromGregorianDate(new Date(Number.NaN))).toThrow();
  });
});
