import { DayStatusEngine } from '../src/enterprise/DayStatusEngine';
import { HolidayEngine } from '../src/enterprise/HolidayEngine';
import { WebtananDatePicker } from '../src/ui/WebtananDatePicker';

describe('DatePicker selection and policy', () => {
  test('multiple تاریخ‌ها را نرمال، یکتا و مرتب نگه می‌دارد', () => {
    const picker = new WebtananDatePicker({ multiple: true });
    picker.setMultipleDates(['1405/6/12', '1405/06/11', '1405/06/11']);
    expect(picker.getMultipleDates()).toEqual(['1405/06/11', '1405/06/12']);

    expect(picker.toggleMultipleDate('1405/06/11')).toBe(false);
    expect(picker.getMultipleDates()).toEqual(['1405/06/12']);
    expect(picker.toggleMultipleDate('1405/06/13')).toBe(true);
    expect(picker.getMultipleDates()).toEqual(['1405/06/12', '1405/06/13']);
  });

  test('range و multiple هم‌زمان قابل فعال‌سازی نیستند', () => {
    expect(() => new WebtananDatePicker({ range: true, multiple: true })).toThrow();
  });

  test('disabled dates در انتخاب مستقیم و بازه اعمال می‌شوند', () => {
    const picker = new WebtananDatePicker({
      range: true,
      disabledDates: ['1405/06/10'],
    });

    expect(picker.isDateDisabled('1405/06/10')).toBe(true);
    expect(() => picker.setDate('1405/06/10')).toThrow('غیرفعال');
    expect(() => picker.setRange('1405/06/01', '1405/06/20')).toThrow('1405/06/10');
    expect(() => picker.setRange('1405/06/11', '1405/06/20')).not.toThrow();
  });

  test('تغییر disabled dates انتخاب نامعتبر قبلی را حذف می‌کند', () => {
    const picker = new WebtananDatePicker({ multiple: true });
    picker.setMultipleDates(['1405/06/11', '1405/06/12']);
    picker.setDisabledDates(['1405/06/11']);
    expect(picker.getMultipleDates()).toEqual(['1405/06/12']);
    expect(picker.getDisabledDates()).toEqual(['1405/06/11']);
  });

  test('HolidayEngine و DayStatusEngine به API DatePicker متصل می‌شوند', () => {
    const holidays = new HolidayEngine();
    holidays.add({ date: '1405/01/01', title: 'نوروز', type: 'official', source: 'fixed-solar' });
    const statuses = new DayStatusEngine();
    statuses.set('1405/06/11', 'meeting');

    const picker = new WebtananDatePicker();
    picker.setHolidayEngine(holidays);
    picker.setDayStatusEngine(statuses);

    expect(picker.getHolidays('1405/01/01')[0]?.title).toBe('نوروز');
    expect(picker.getDayStatus('1405/06/11')).toBe('meeting');
    expect(picker.getDayStatus('1405/06/12')).toBe('free');
  });

  test('state چندتاریخی export/import می‌شود', () => {
    const source = new WebtananDatePicker({ multiple: true });
    source.setMultipleDates(['1405/06/11', '1405/06/20']);
    const state = source.exportState();

    const target = new WebtananDatePicker({ multiple: true });
    target.importState(state);
    expect(target.getMultipleDates()).toEqual(['1405/06/11', '1405/06/20']);
  });
});
