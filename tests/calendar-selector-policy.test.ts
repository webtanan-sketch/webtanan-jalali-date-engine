import { InteractiveCalendar } from '../src/calendar/InteractiveCalendar';
import { RangeSelector } from '../src/calendar/RangeSelector';
import { MultiDateSelector } from '../src/calendar/MultiDateSelector';

describe('Standalone selector policies', () => {
  test('InteractiveCalendar تاریخ را نرمال و معادل میلادی می‌دهد', () => {
    const calendar = new InteractiveCalendar();
    expect(calendar.select('۱۴۰۵/۶/۱۱')).toBe('1405/06/11');
    expect(calendar.getSelectedGregorian()).toBe('2026-09-02');
    expect(calendar.isSelected('1405/06/11')).toBe(true);
  });

  test('InteractiveCalendar حداقل/حداکثر و disabled را اعمال می‌کند', () => {
    const calendar = new InteractiveCalendar({
      minDate: '1405/06/01',
      maxDate: '1405/06/30',
      disabledDates: ['1405/06/11'],
    });
    expect(calendar.isDisabled('1405/06/11')).toBe(true);
    expect(() => calendar.select('1405/05/31')).toThrow('غیرفعال');
    expect(() => calendar.select('1405/06/11')).toThrow('غیرفعال');
  });

  test('RangeSelector طول بازه و contains را محاسبه می‌کند', () => {
    const range = new RangeSelector({ maxDays: 10 });
    range.setRange('1405/06/01', '1405/06/05');
    expect(range.getDurationDays()).toBe(5);
    expect(range.contains('1405/06/03')).toBe(true);
    expect(range.isComplete()).toBe(true);
    expect(() => range.setRange('1405/06/01', '1405/06/20')).toThrow('بیشتر');
  });

  test('RangeSelector از عبور بازه از تاریخ disabled جلوگیری می‌کند', () => {
    const range = new RangeSelector({ disabledDates: ['1405/06/05'] });
    expect(() => range.setRange('1405/06/01', '1405/06/10')).toThrow('غیرفعال');
  });

  test('MultiDateSelector محدودیت تعداد، toggle و حذف تکراری را مدیریت می‌کند', () => {
    const selector = new MultiDateSelector({ maxSelections: 2 });
    expect(selector.add('1405/06/01')).toBe(true);
    expect(selector.add('1405/06/01')).toBe(false);
    expect(selector.toggle('1405/06/02')).toBe(true);
    expect(selector.count()).toBe(2);
    expect(() => selector.add('1405/06/03')).toThrow('حداکثر');
    expect(selector.toggle('1405/06/02')).toBe(false);
    expect(selector.count()).toBe(1);
  });

  test('MultiDateSelector در setDisabledDates انتخاب قبلی را حذف می‌کند', () => {
    const selector = new MultiDateSelector();
    selector.addMany(['1405/06/01', '1405/06/02']);
    selector.setDisabledDates(['1405/06/02']);
    expect(selector.getAll()).toEqual(['1405/06/01']);
  });
});
