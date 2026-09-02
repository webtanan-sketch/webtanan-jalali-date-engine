export * from './index';

import { defineWebtananJalaliDatePicker } from './web-component/WebtananJalaliDatePickerElement';

/**
 * در Bundle مرورگر، Web Component به‌صورت خودکار ثبت می‌شود.
 * در Node/Electron main process این فراخوانی امن است و false برمی‌گرداند.
 */
export const webtananJalaliWebComponentDefined = defineWebtananJalaliDatePicker();
