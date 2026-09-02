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

  test('رویدادهای یک تاریخ مستقل نگهداری می‌شوند', () => {
    const picker = new WebtananDatePicker({ events: true });
    picker.addEvent({ date: '1405/06/11', title: 'جلسه' });
    picker.addEvent({ date: '1405/06/11', title: 'پیگیری' });
    picker.addEvent({ date: '1405/06/12', title: 'تحویل' });

    expect(picker.getEvents('1405/06/11')).toHaveLength(2);
    expect(picker.getEvents('1405/06/12')).toHaveLength(1);
  });

  test('در محیط Node بدون DOM، open به‌صورت امن null برمی‌گرداند', () => {
    const picker = new WebtananDatePicker();
    expect(picker.open()).toBeNull();
  });
});
