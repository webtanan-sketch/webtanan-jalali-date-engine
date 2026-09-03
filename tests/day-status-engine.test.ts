import { DayStatusEngine } from '../src/enterprise/DayStatusEngine';

describe('DayStatusEngine', () => {
  test('API قدیمی set(date,status) حفظ شده و تاریخ نرمال می‌شود', () => {
    const engine = new DayStatusEngine();
    engine.set('۱۴۰۵/۶/۱۱', 'meeting');
    expect(engine.get('1405/06/11')).toBe('meeting');
    expect(engine.getRecord('1405/06/11')?.date).toBe('1405/06/11');
  });

  test('رکورد کامل شامل کاربر و metadata ثبت می‌شود', () => {
    const engine = new DayStatusEngine();
    const record = engine.set({
      date: '1405/06/11',
      status: 'closed',
      title: 'توقف تولید',
      description: 'تعمیرات برنامه‌ریزی‌شده',
      user: 'مدیر کارخانه',
    });
    expect(record).toMatchObject({
      date: '1405/06/11',
      status: 'closed',
      title: 'توقف تولید',
      user: 'مدیر کارخانه',
    });
    expect(record.createdAt).toMatch(/^\d{4}-/);
    expect(record.updatedAt).toMatch(/^\d{4}-/);
  });

  test('setMany، فیلتر وضعیت و حذف گروهی کار می‌کنند', () => {
    const engine = new DayStatusEngine();
    engine.setMany([
      { date: '1405/06/10', status: 'work' },
      { date: '1405/06/11', status: 'meeting' },
      { date: '1405/06/12', status: 'meeting' },
    ]);
    expect(engine.getByStatus('meeting')).toHaveLength(2);
    expect(engine.clearByStatus('meeting')).toBe(2);
    expect(engine.get('1405/06/11')).toBe('free');
    expect(engine.list()).toHaveLength(1);
  });

  test('تاریخ نامعتبر مثل ۳۰ اسفند ۱۴۰۴ رد می‌شود', () => {
    const engine = new DayStatusEngine();
    expect(() => engine.set('1404/12/30', 'closed')).toThrow('نامعتبر');
  });
});
