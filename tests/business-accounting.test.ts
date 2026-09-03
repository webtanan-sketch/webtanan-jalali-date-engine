import { BusinessDayCalculator } from '../src/enterprise/BusinessDayCalculator';
import { DayStatusEngine } from '../src/enterprise/DayStatusEngine';
import { HolidayEngine } from '../src/enterprise/HolidayEngine';
import { getIranOfficialHolidayDataset } from '../src/enterprise/holidays/IranOfficialHolidayDatasets';
import { AccountingCalendarAdapter } from '../src/integrations/AccountingCalendarAdapter';

describe('Business day & accounting calendar', () => {
  test('جمعه به‌صورت پیش‌فرض روز کاری نیست', () => {
    const calculator = new BusinessDayCalculator();
    expect(calculator.isBusinessDay('1405/01/07')).toBe(false);
    expect(calculator.nextBusinessDay('1405/01/07')).toBe('1405/01/08');
  });

  test('تعطیلات رسمی ۱۴۰۵ در محاسبه روز کاری لحاظ می‌شوند', () => {
    const holidays = new HolidayEngine();
    const dataset = getIranOfficialHolidayDataset(1405);
    if (!dataset) throw new Error('دیتاست ۱۴۰۵ در دسترس نیست.');
    holidays.load(dataset, 1405);
    const calculator = new BusinessDayCalculator({ holidays });

    expect(calculator.isBusinessDay('1405/01/01')).toBe(false);
    expect(calculator.nextBusinessDay('1405/01/04')).toBe('1405/01/05');
  });

  test('روز بسته سازمانی حتی اگر تعطیل رسمی نباشد روز کاری نیست', () => {
    const statuses = new DayStatusEngine();
    statuses.set('1405/06/11', 'closed');
    const calculator = new BusinessDayCalculator({ dayStatuses: statuses });
    expect(calculator.isBusinessDay('1405/06/11')).toBe(false);
  });

  test('افزودن روز کاری از روی تعطیلی و آخر هفته عبور می‌کند', () => {
    const holidays = new HolidayEngine();
    holidays.add({ date: '1405/01/09', title: 'تعطیلی شرکت', type: 'company', source: 'company' });
    const calculator = new BusinessDayCalculator({ holidays });
    // ۷ فروردین جمعه، ۸ شنبه کاری، ۹ تعطیل شرکت، بنابراین دو روز کاری بعد = ۱۰ فروردین
    expect(calculator.addBusinessDays('1405/01/07', 2)).toBe('1405/01/10');
  });

  test('رکورد حسابداری معادل میلادی و metadata کامل می‌گیرد', () => {
    const accounting = new AccountingCalendarAdapter();
    const record = accounting.add({
      id: 'ACC-1',
      date: '۱۴۰۵/۶/۱۱',
      title: 'سررسید پرداخت مشتری',
      type: 'payment-due',
      amount: 25000000,
      user: 'حسابدار',
      createdAt: '2026-09-03T12:00:00.000Z',
    });

    expect(record.date).toBe('1405/06/11');
    expect(record.gregorianDate).toBe('2026-09-02');
    expect(record.status).toBe('pending');
    expect(record.createdAt).toBe('2026-09-03T12:00:00.000Z');
  });

  test('سررسیدهای باز و جمع مبالغ قابل گزارش هستند', () => {
    const accounting = new AccountingCalendarAdapter();
    accounting.add({ id: 'D1', date: '1405/06/10', title: 'سررسید اول', type: 'payment-due', amount: 1000 });
    accounting.add({ id: 'D2', date: '1405/06/12', title: 'سررسید دوم', type: 'payment-due', amount: 2000 });
    accounting.add({ id: 'R1', date: '1405/06/11', title: 'دریافت', type: 'payment-received', amount: 700 });

    expect(accounting.getPendingDues('1405/06/11').map((item) => item.id)).toEqual(['D1']);
    expect(accounting.sum('payment-due', 'pending')).toBe(3000);
    accounting.update('D1', { status: 'done' });
    expect(accounting.sum('payment-due', 'pending')).toBe(2000);
  });
});
