import { HolidayEngine } from '../src/enterprise/HolidayEngine';
import { IranHolidayProvider } from '../src/enterprise/holidays/IranHolidayProvider';

describe('IranHolidayProvider', () => {
  test('دیتاست رسمی کامل ۱۴۰۴ و ۱۴۰۵ را بارگذاری می‌کند', () => {
    const provider = new IranHolidayProvider();

    const holidays1404 = provider.getHolidays(1404);
    const holidays1405 = provider.getHolidays(1405);

    expect(holidays1404).toHaveLength(26);
    expect(holidays1405).toHaveLength(26);
    expect(holidays1404.some((item) => item.date === '1404/04/15' && item.title.includes('عاشورا'))).toBe(true);
    expect(holidays1405.some((item) => item.date === '1405/01/25' && item.title.includes('جعفر صادق'))).toBe(true);
    expect(holidays1405.some((item) => item.date === '1405/12/19' && item.title.includes('فطر'))).toBe(true);
  });

  test('HolidayEngine دیتاست رسمی سالانه را بدون تکرار بارگذاری می‌کند', () => {
    const engine = new HolidayEngine();
    const provider = new IranHolidayProvider();

    expect(engine.load(provider, 1405)).toBe(26);
    expect(engine.isHoliday('1405/01/01')).toBe(true);
    expect(engine.get('1405/11/22')[0]?.title).toContain('انقلاب');
    expect(engine.get('1405/01/01')).toHaveLength(1);
  });

  test('برای سال بدون دیتاست داخلی، تعطیلات ثابت شمسی fallback می‌شوند', () => {
    const provider = new IranHolidayProvider();
    const items = provider.getHolidays(1406);
    expect(items).toHaveLength(10);
    expect(items.some((item) => item.date === '1406/01/13')).toBe(true);
  });

  test('تعطیلی تکراری دوباره ذخیره نمی‌شود', () => {
    const engine = new HolidayEngine();
    const holiday = {
      id: 'factory-stop',
      date: '1405/06/11',
      title: 'تعطیلی کارخانه',
      type: 'company' as const,
      source: 'company' as const,
    };

    engine.add(holiday);
    engine.add(holiday);
    expect(engine.get('1405/06/11')).toHaveLength(1);
  });

  test('تاریخ نامعتبر رد می‌شود', () => {
    const engine = new HolidayEngine();
    expect(() => engine.add({
      date: '1405/07/31',
      title: 'نامعتبر',
      type: 'company',
    })).toThrow();
  });

  test('تعطیلات تکمیلی سالانه قابل تزریق هستند', () => {
    const provider = new IranHolidayProvider({
      movable: {
        1405: [
          { month: 2, day: 10, title: 'نمونه تعطیلی تکمیلی', id: 'movable-sample' },
        ],
      },
    });

    const engine = new HolidayEngine();
    expect(engine.load(provider, 1405)).toBe(27);
    expect(engine.get('1405/02/10').some((item) => item.id === 'movable-sample')).toBe(true);
  });

  test('حذف انتخابی و clear کار می‌کند', () => {
    const engine = new HolidayEngine();
    engine.addMany([
      { date: '1405/06/11', title: 'جلسه تعطیل', type: 'company', id: 'a' },
      { date: '1405/06/11', title: 'تعطیلی دوم', type: 'company', id: 'b' },
    ]);

    expect(engine.remove('1405/06/11', (item) => item.id === 'a')).toBe(1);
    expect(engine.get('1405/06/11')).toHaveLength(1);
    engine.clear();
    expect(engine.getAll()).toHaveLength(0);
  });
});
