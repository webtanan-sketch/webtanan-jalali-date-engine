import { AnnualHolidayDataset } from '../src/enterprise/holidays/AnnualHolidayDataset';

describe('AnnualHolidayDataset', () => {
  test('دیتاست معتبر ساخته و serialize می‌شود', () => {
    const dataset = new AnnualHolidayDataset({
      schemaVersion: 1,
      year: 1405,
      source: {
        title: 'تقویم رسمی نمونه',
        url: 'https://example.test/calendar-1405',
        verifiedAt: '2026-09-02',
      },
      holidays: [
        { date: '1405/02/01', title: 'تعطیلی نمونه', type: 'official', source: 'movable' },
      ],
    });

    expect(dataset.name).toBe('iran-annual-1405');
    expect(dataset.version).toBe('1');
    expect(dataset.getHolidays(1405)).toHaveLength(1);
    expect(dataset.getHolidays(1404)).toHaveLength(0);
    expect(AnnualHolidayDataset.fromJSON(JSON.stringify(dataset.toJSON())).year).toBe(1405);
  });

  test('تاریخ خارج از سال دیتاست رد می‌شود', () => {
    expect(() => new AnnualHolidayDataset({
      schemaVersion: 1,
      year: 1405,
      source: { title: 'منبع', verifiedAt: '2026-09-02' },
      holidays: [
        { date: '1404/12/29', title: 'اشتباه', type: 'official', source: 'movable' },
      ],
    })).toThrow('خارج از سال');
  });

  test('تعطیلی تکراری رد می‌شود', () => {
    expect(() => new AnnualHolidayDataset({
      schemaVersion: 1,
      year: 1405,
      source: { title: 'منبع', verifiedAt: '2026-09-02' },
      holidays: [
        { date: '1405/03/10', title: 'نمونه', type: 'official', source: 'movable' },
        { date: '1405/03/10', title: 'نمونه', type: 'official', source: 'movable' },
      ],
    })).toThrow('تکراری');
  });
});
