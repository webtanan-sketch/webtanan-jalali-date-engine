import { HolidayEngine } from '../src/enterprise/HolidayEngine';
import { IranHolidayProvider } from '../src/enterprise/holidays/IranHolidayProvider';

describe('HolidayEngine v0.6', () => {
  test('تعطیلات ثابت ایران را برای سال انتخابی بارگذاری می‌کند', () => {
    const engine = new HolidayEngine();
    const provider = new IranHolidayProvider();

    expect(engine.load(provider, 1405)).toBe(10);
    expect(engine.isHoliday('1405/01/01')).toBe(true);
    expect(engine.get('1405/11/22')[0]?.title).toContain('انقلاب');
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

  test('تعطیلات متحرک سالانه قابل تزریق هستند', () => {
    const provider = new IranHolidayProvider({
      movable: {
        1405: [
          { month: 2, day: 10, title: 'نمونه تعطیلی متحرک', id: 'movable-sample' },
        ],
      },
    });

    const engine = new HolidayEngine();
    engine.load(provider, 1405);
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
