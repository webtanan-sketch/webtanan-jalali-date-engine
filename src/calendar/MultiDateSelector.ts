import { JalaliConverter } from '../core/converter';

const normalize = (value: string): string => {
  const match = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت تاریخ باید مانند 1405/06/11 باشد.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!JalaliConverter.isValid(date)) throw new RangeError('تاریخ شمسی نامعتبر است.');
  return JalaliConverter.format(date);
};

export class MultiDateSelector {
  private dates: string[] = [];

  add(date: string): void {
    const normalized = normalize(date);
    if (!this.dates.includes(normalized)) this.dates.push(normalized);
  }

  remove(date: string): void {
    const normalized = normalize(date);
    this.dates = this.dates.filter((item) => item !== normalized);
  }

  has(date: string): boolean {
    return this.dates.includes(normalize(date));
  }

  getAll(): string[] {
    return [...this.dates];
  }

  clear(): void {
    this.dates = [];
  }
}
