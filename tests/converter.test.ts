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

  test('رفت و برگشت تاریخ بدون تغییر انجام می‌شود', () => {
    const source = { year: 1405, month: 12, day: 15 };
    const gregorian = JalaliConverter.toGregorian(source);
    expect(JalaliConverter.toJalali(gregorian)).toEqual(source);
  });

  test('روز شمسی نامعتبر رد می‌شود', () => {
    expect(JalaliConverter.isValid({ year: 1405, month: 7, day: 31 })).toBe(false);
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
