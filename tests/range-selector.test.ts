import { RangeSelector } from '../src/calendar/RangeSelector';
import { MultiDateSelector } from '../src/calendar/MultiDateSelector';

describe('RangeSelector', () => {
  test('بازه شروع و پایان ثبت می‌شود و شروع جدید پایان قبلی را پاک می‌کند', () => {
    const selector = new RangeSelector();
    selector.setStart('1405/06/01');
    selector.setEnd('1405/06/20');

    expect(selector.getRange()).toEqual({ start: '1405/06/01', end: '1405/06/20' });

    selector.setStart('1405/07/01');
    expect(selector.getRange()).toEqual({ start: '1405/07/01', end: null });
  });

  test('پاک‌سازی بازه هر دو مقدار را null می‌کند', () => {
    const selector = new RangeSelector();
    selector.setStart('1405/06/01');
    selector.setEnd('1405/06/02');
    selector.clear();

    expect(selector.getRange()).toEqual({ start: null, end: null });
  });
});

describe('MultiDateSelector', () => {
  test('تاریخ تکراری دوباره اضافه نمی‌شود', () => {
    const selector = new MultiDateSelector();
    selector.add('1405/06/01');
    selector.add('1405/06/10');
    selector.add('1405/06/10');

    expect(selector.getAll()).toEqual(['1405/06/01', '1405/06/10']);
  });

  test('حذف و پاک‌سازی انتخاب‌های چندتاریخی کار می‌کند', () => {
    const selector = new MultiDateSelector();
    selector.add('1405/06/01');
    selector.add('1405/06/10');
    selector.remove('1405/06/01');
    expect(selector.getAll()).toEqual(['1405/06/10']);

    selector.clear();
    expect(selector.getAll()).toEqual([]);
  });
});
