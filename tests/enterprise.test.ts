import { HolidayEngine } from '../src/enterprise/HolidayEngine';
import { DayStatusEngine } from '../src/enterprise/DayStatusEngine';

describe('Enterprise calendar layer', () => {
  test('تعطیلات رسمی و شرکتی ثبت و بازیابی می‌شوند', () => {
    const holidays = new HolidayEngine();
    holidays.add({ date: '1405/01/01', title: 'نوروز', type: 'official' });
    holidays.add({ date: '1405/06/20', title: 'تعطیلی کارخانه', type: 'company' });

    expect(holidays.isHoliday('1405/01/01')).toBe(true);
    expect(holidays.get('1405/01/01')).toEqual([
      { date: '1405/01/01', title: 'نوروز', type: 'official' },
    ]);
    expect(holidays.isHoliday('1405/06/21')).toBe(false);
  });

  test('وضعیت روز قابل ثبت، خواندن و پاک‌کردن است', () => {
    const statuses = new DayStatusEngine();

    expect(statuses.get('1405/06/11')).toBe('free');
    statuses.set('1405/06/11', 'meeting');
    expect(statuses.get('1405/06/11')).toBe('meeting');

    statuses.clear('1405/06/11');
    expect(statuses.get('1405/06/11')).toBe('free');
  });
});
