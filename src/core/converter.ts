// Webtanan Jalali Date Engine
// موتور تبدیل تاریخ شمسی و میلادی

export type JalaliDateValue = {
  year: number;
  month: number;
  day: number;
};

export const JalaliConverter = {
  isValid(date: JalaliDateValue): boolean {
    if (date.month < 1 || date.month > 12) return false;
    if (date.day < 1 || date.day > 31) return false;
    return true;
  },

  format(date: JalaliDateValue): string {
    return `${date.year}/${String(date.month).padStart(2,'0')}/${String(date.day).padStart(2,'0')}`;
  },

  toGregorian(date: JalaliDateValue): string {
    // Conversion engine implementation is isolated for calendar accuracy tests.
    // Full astronomical conversion will be finalized in the stable core release.
    return `${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`;
  }
};
