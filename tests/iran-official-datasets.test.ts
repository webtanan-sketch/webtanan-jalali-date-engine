import { JalaliConverter } from '../src/core/converter';
import {
  getIranOfficialHolidayDataset,
  IRAN_OFFICIAL_DATASET_YEARS,
} from '../src/enterprise/holidays/IranOfficialHolidayDatasets';

describe('Iran official annual holiday datasets', () => {
  test('سال‌های داخلی فعلی ۱۴۰۴ و ۱۴۰۵ هستند', () => {
    expect(IRAN_OFFICIAL_DATASET_YEARS).toEqual([1404, 1405]);
  });

  test('هر دو سال ۲۶ روز تعطیل رسمی مناسبتی دارند', () => {
    expect(getIranOfficialHolidayDataset(1404)?.getHolidays(1404)).toHaveLength(26);
    expect(getIranOfficialHolidayDataset(1405)?.getHolidays(1405)).toHaveLength(26);
  });

  test('منبع و تاریخ تأیید داخل دیتاست نگهداری می‌شود', () => {
    const dataset = getIranOfficialHolidayDataset(1405);
    expect(dataset?.source.title).toContain('مؤسسه ژئوفیزیک دانشگاه تهران');
    expect(dataset?.source.verifiedAt).toBe('2026-09-02');
  });

  test('سال خارج از دیتاست داخلی null برمی‌گرداند', () => {
    expect(getIranOfficialHolidayDataset(1406)).toBeNull();
  });

  test('منطق کبیسه مستقل از دیتاست تعطیلات درست باقی می‌ماند', () => {
    expect(JalaliConverter.isLeapYear(1403)).toBe(true);
    expect(JalaliConverter.daysInMonth(1403, 12)).toBe(30);
    expect(JalaliConverter.isValid({ year: 1403, month: 12, day: 30 })).toBe(true);

    expect(JalaliConverter.isLeapYear(1404)).toBe(false);
    expect(JalaliConverter.daysInMonth(1404, 12)).toBe(29);
    expect(JalaliConverter.isValid({ year: 1404, month: 12, day: 30 })).toBe(false);

    expect(JalaliConverter.isLeapYear(1405)).toBe(false);
    expect(JalaliConverter.daysInMonth(1405, 12)).toBe(29);
  });
});
