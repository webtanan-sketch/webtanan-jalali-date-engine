import { WebtananDatePicker } from '../src/ui/WebtananDatePicker';

describe('WebtananDatePicker API', () => {
  test('تاریخ انتخابی را استاندارد می‌کند و بازمی‌گرداند', () => {
    const picker = new WebtananDatePicker();
    picker.setDate('1405/6/11');
    expect(picker.getDate()).toBe('1405/06/11');
  });

  test('حداقل و حداکثر تاریخ اعمال می‌شود', () => {
    const picker = new WebtananDatePicker({
      minDate: '1405/06/01',
      maxDate: '1405/06/20',
    });

    expect(() => picker.setDate('1405/05/31')).toThrow();
    expect(() => picker.setDate('1405/06/21')).toThrow();
    expect(() => picker.setDate('1405/06/11')).not.toThrow();
  });

  test('بازه معتبر ثبت و بازه معکوس رد می‌شود', () => {
    const picker = new WebtananDatePicker({ range: true });
    picker.setRange('1405/06/01', '1405/06/20');
    expect(picker.getRange()).toEqual({ start: '1405/06/01', end: '1405/06/20' });
    expect(() => picker.setRange('1405/06/20', '1405/06/01')).toThrow();
  });

  test('Date + Time با گام ۱۵ دقیقه خروجی استاندارد می‌دهد', () => {
    const picker = new WebtananDatePicker({ time: true, minuteStep: 15 });
    picker.setDate('1405/06/11');
    picker.setTime(14, 30);

    expect(picker.getTime()).toEqual({ hour: 14, minute: 30, second: 0 });
    expect(picker.getFormattedTime()).toBe('14:30');
    expect(picker.getDateTime()).toBe('1405/06/11 14:30');
    expect(() => picker.setTime(14, 22)).toThrow();
  });

  test('نمایش ثانیه در صورت فعال بودن پشتیبانی می‌شود', () => {
    const picker = new WebtananDatePicker({ time: true, seconds: true, minuteStep: 5, secondStep: 5 });
    picker.setDate('1405/06/11');
    picker.setTime(8, 15, 25);
    expect(picker.getDateTime()).toBe('1405/06/11 08:15:25');
  });

  test('رویدادهای یک تاریخ مستقل نگهداری می‌شوند', () => {
    const picker = new WebtananDatePicker({ events: true });
    picker.addEvent({ date: '1405/06/11', title: 'جلسه' });
    picker.addEvent({ date: '1405/06/11', title: 'پیگیری' });
    picker.addEvent({ date: '1405/06/12', title: 'تحویل' });

    expect(picker.getEvents('1405/06/11')).toHaveLength(2);
    expect(picker.getEvents('1405/06/12')).toHaveLength(1);
  });

  test('clear تاریخ، بازه و زمان را پاک می‌کند', () => {
    const picker = new WebtananDatePicker({ time: true, range: true });
    picker.setDate('1405/06/11');
    picker.setRange('1405/06/01', '1405/06/20');
    picker.setTime(9, 15);
    picker.clear();

    expect(picker.getDate()).toBeNull();
    expect(picker.getRange()).toBeNull();
    expect(picker.getTime()).toBeNull();
  });

  test('در محیط Node بدون DOM، open به‌صورت امن null برمی‌گرداند', () => {
    const picker = new WebtananDatePicker();
    expect(picker.open()).toBeNull();
  });
});
