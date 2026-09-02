export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export class JalaliConverter {
  static validate(date: JalaliDate): boolean {
    if (date.month < 1 || date.month > 12) return false;
    if (date.day < 1 || date.day > 31) return false;
    return true;
  }

  static format(date: JalaliDate): string {
    return `${date.year}/${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}`;
  }
}
