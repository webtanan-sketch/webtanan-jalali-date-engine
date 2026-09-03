import { WebtananDatePicker } from '../src/ui/WebtananDatePicker';
import {
  applyPickerValue,
  modeFromOptions,
  readPickerValue,
} from '../src/framework/valueCodec';
import { WebtananJalaliDatePickerReact } from '../src/framework/react';
import { WebtananJalaliDatePickerVue } from '../src/framework/vue';

describe('Framework adapters', () => {
  test('حالت انتخاب از options به‌درستی تشخیص داده می‌شود', () => {
    expect(modeFromOptions()).toBe('single');
    expect(modeFromOptions({ range: true })).toBe('range');
    expect(modeFromOptions({ multiple: true })).toBe('multiple');
    expect(() => modeFromOptions({ range: true, multiple: true })).toThrow();
  });

  test('Codec مقدار تک‌تاریخ و زمان را رفت و برگشت می‌کند', () => {
    const picker = new WebtananDatePicker({ time: true, minuteStep: 15 });
    applyPickerValue(picker, '1405/06/11 14:30', { time: true });
    expect(readPickerValue(picker, { time: true })).toBe('1405/06/11 14:30');
  });

  test('Codec بازه را رفت و برگشت می‌کند', () => {
    const picker = new WebtananDatePicker({ range: true });
    applyPickerValue(picker, '1405/06/01..1405/06/10', { range: true });
    expect(readPickerValue(picker, { range: true })).toBe('1405/06/01..1405/06/10');
  });

  test('Codec چندتاریخی تکراری‌ها را حذف می‌کند', () => {
    const picker = new WebtananDatePicker({ multiple: true });
    applyPickerValue(
      picker,
      '1405/06/01,1405/06/10,1405/06/01',
      { multiple: true },
    );
    expect(readPickerValue(picker, { multiple: true })).toBe('1405/06/01,1405/06/10');
  });

  test('ورودی خالی state انتخاب را پاک می‌کند', () => {
    const picker = new WebtananDatePicker();
    picker.setDate('1405/06/11');
    applyPickerValue(picker, '', {});
    expect(picker.getDate()).toBeNull();
  });

  test('ماژول‌های React و Vue قابل بارگذاری هستند', () => {
    expect(typeof WebtananJalaliDatePickerReact).toBe('function');
    expect(WebtananJalaliDatePickerVue).toBeTruthy();
  });
});
