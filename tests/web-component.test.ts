import {
  WebtananJalaliDatePickerElement,
  defineWebtananJalaliDatePicker,
} from '../src/web-component/WebtananJalaliDatePickerElement';

describe('Web Component', () => {
  test('import در محیط Node بدون DOM امن است', () => {
    expect(WebtananJalaliDatePickerElement).toBeDefined();
    expect(defineWebtananJalaliDatePicker()).toBe(false);
  });
});
