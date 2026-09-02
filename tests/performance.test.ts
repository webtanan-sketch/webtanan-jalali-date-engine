import { JalaliConverter } from '../src/core/converter';

describe('Performance / Stress', () => {
  test('پنج هزار تبدیل رفت و برگشت در محدوده قابل قبول انجام می‌شود', () => {
    const startedAt = Date.now();
    let checksum = 0;

    for (let index = 0; index < 5000; index += 1) {
      const year = 1380 + (index % 80);
      const month = (index % 12) + 1;
      const max = JalaliConverter.daysInMonth(year, month);
      const day = (index % max) + 1;
      const source = { year, month, day };
      const gregorian = JalaliConverter.toGregorian(source);
      const roundTrip = JalaliConverter.toJalali(gregorian);

      expect(roundTrip).toEqual(source);
      checksum += gregorian.year + gregorian.month + gregorian.day;
    }

    const duration = Date.now() - startedAt;
    expect(checksum).toBeGreaterThan(0);
    expect(duration).toBeLessThan(5000);
  });
});
