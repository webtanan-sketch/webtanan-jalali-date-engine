import { KeyboardDateNavigator } from '../src/accessibility/KeyboardDateNavigator';

describe('KeyboardDateNavigator', () => {
  test('Arrowها در RTL روز را درست جابه‌جا می‌کنند', () => {
    const date = { year: 1405, month: 6, day: 11 };
    expect(KeyboardDateNavigator.navigate(date, 'ArrowLeft', true)).toEqual({ year: 1405, month: 6, day: 12 });
    expect(KeyboardDateNavigator.navigate(date, 'ArrowRight', true)).toEqual({ year: 1405, month: 6, day: 10 });
  });

  test('بالا و پایین یک هفته جابه‌جا می‌شوند', () => {
    const date = { year: 1405, month: 6, day: 11 };
    expect(KeyboardDateNavigator.navigate(date, 'ArrowUp')).toEqual({ year: 1405, month: 6, day: 4 });
    expect(KeyboardDateNavigator.navigate(date, 'ArrowDown')).toEqual({ year: 1405, month: 6, day: 18 });
  });

  test('PageUp/PageDown با حفظ روز تا حد ممکن ماه را تغییر می‌دهند', () => {
    expect(KeyboardDateNavigator.navigate({ year: 1405, month: 1, day: 31 }, 'PageDown')).toEqual({
      year: 1405,
      month: 2,
      day: 31,
    });

    expect(KeyboardDateNavigator.navigate({ year: 1405, month: 6, day: 31 }, 'PageDown')).toEqual({
      year: 1405,
      month: 7,
      day: 30,
    });
  });

  test('Home و End ابتدا و انتهای ماه را می‌دهند', () => {
    const date = { year: 1405, month: 7, day: 12 };
    expect(KeyboardDateNavigator.navigate(date, 'Home')).toEqual({ year: 1405, month: 7, day: 1 });
    expect(KeyboardDateNavigator.navigate(date, 'End')).toEqual({ year: 1405, month: 7, day: 30 });
  });

  test('عبور از مرز سال درست است', () => {
    expect(KeyboardDateNavigator.addDays({ year: 1404, month: 12, day: 29 }, 1)).toEqual({
      year: 1405,
      month: 1,
      day: 1,
    });
    expect(KeyboardDateNavigator.addMonths({ year: 1405, month: 1, day: 10 }, -1)).toEqual({
      year: 1404,
      month: 12,
      day: 10,
    });
  });
});
