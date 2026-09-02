import { TimeSelector } from '../src/time/TimeSelector';

describe('TimeSelector', () => {
  test('گام ۱۵ دقیقه و فرمت زمان', () => {
    const selector = new TimeSelector({ minuteStep: 15 });
    selector.set(8, 30);
    expect(selector.format()).toBe('08:30');
    expect(selector.getMinuteOptions()).toEqual([0, 15, 30, 45]);
  });

  test('دقیقه خارج از گام رد می‌شود', () => {
    const selector = new TimeSelector({ minuteStep: 15 });
    expect(() => selector.set(8, 10)).toThrow();
  });

  test('نمایش ثانیه اختیاری است', () => {
    const selector = new TimeSelector({ includeSeconds: true, secondStep: 5 });
    selector.set(14, 0, 25);
    expect(selector.format()).toBe('14:00:25');
  });
});
