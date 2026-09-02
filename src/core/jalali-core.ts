export interface JalaliDateValue {
  year: number;
  month: number;
  day: number;
}

export class JalaliCore {
  static isValid(date: JalaliDateValue): boolean {
    if (date.month < 1 || date.month > 12) return false;
    if (date.day < 1 || date.day > 31) return false;
    return true;
  }

  static format(date: JalaliDateValue): string {
    return `${date.year}/${String(date.month).padStart(2,'0')}/${String(date.day).padStart(2,'0')}`;
  }

  static toGregorian(date: JalaliDateValue): string {
    // Conversion engine will be completed in v0.2.0
    return `${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`;
  }
}
