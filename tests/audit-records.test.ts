import { EventEngine } from '../src/enterprise/EventEngine';
import { CRMAdapter } from '../src/integrations/CRMAdapter';

describe('Audit & record layer', () => {
  test('EventEngine تاریخ میلادی، ساعت و createdAt را ثبت می‌کند', () => {
    const engine = new EventEngine();
    const record = engine.add({
      id: 'evt-1',
      date: '1405/06/11',
      time: '9:05',
      title: 'جلسه فروش',
      type: 'meeting',
      user: 'مدیر فروش',
      description: 'بررسی پیش‌فاکتور',
      createdAt: '2026-09-03T10:00:00.000Z',
    });

    expect(record).toMatchObject({
      id: 'evt-1',
      date: '1405/06/11',
      gregorianDate: '2026-09-02',
      time: '09:05',
      createdAt: '2026-09-03T10:00:00.000Z',
      user: 'مدیر فروش',
    });
  });

  test('شناسه رویداد تکراری و تاریخ نامعتبر رد می‌شوند', () => {
    const engine = new EventEngine();
    engine.add({ id: 'evt-1', date: '1405/06/11', title: 'تماس', type: 'call' });
    expect(() => engine.add({ id: 'evt-1', date: '1405/06/12', title: 'تماس دوم', type: 'call' })).toThrow('قبلاً');
    expect(() => engine.add({ id: 'evt-2', date: '1404/12/30', title: 'نامعتبر', type: 'call' })).toThrow('نامعتبر');
  });

  test('به‌روزرسانی تاریخ رویداد معادل میلادی را هم به‌روز می‌کند', () => {
    const engine = new EventEngine();
    engine.add({ id: 'evt-1', date: '1405/01/01', title: 'شروع', type: 'followup', createdAt: '2026-03-21T00:00:00.000Z' });
    const updated = engine.update('evt-1', { date: '1405/06/11' });
    expect(updated.date).toBe('1405/06/11');
    expect(updated.gregorianDate).toBe('2026-09-02');
    expect(updated.createdAt).toBe('2026-03-21T00:00:00.000Z');
  });

  test('CRM API قدیمی حفظ شده و رکورد کامل Audit جداگانه در دسترس است', () => {
    const crm = new CRMAdapter();
    crm.addFollowUp({
      customer: 'رضا احمدی',
      date: '1405/06/11',
      title: 'پیگیری قیمت',
      type: 'followup',
      user: 'کارشناس فروش',
    });

    expect(crm.getCustomerTimeline('رضا احمدی')).toEqual([
      {
        customer: 'رضا احمدی',
        date: '1405/06/11',
        title: 'پیگیری قیمت',
        type: 'followup',
        user: 'کارشناس فروش',
      },
    ]);

    const [record] = crm.getCustomerRecords('رضا احمدی');
    expect(record.id).toBe('crm-1');
    expect(record.gregorianDate).toBe('2026-09-02');
    expect(record.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
