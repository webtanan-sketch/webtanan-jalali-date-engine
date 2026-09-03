import { DateValidator } from '../utils/DateValidator';

export interface MultiDateSelectorOptions {
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  maxSelections?: number;
}

export class MultiDateSelector {
  private dates = new Set<string>();
  private minDate?: string;
  private maxDate?: string;
  private disabledDates = new Set<string>();
  private maxSelections?: number;

  constructor(options: MultiDateSelectorOptions = {}) {
    this.minDate = options.minDate ? DateValidator.assertString(options.minDate) : undefined;
    this.maxDate = options.maxDate ? DateValidator.assertString(options.maxDate) : undefined;
    if (this.minDate && this.maxDate && this.minDate > this.maxDate) throw new RangeError('محدوده تاریخ نامعتبر است.');
    if (options.maxSelections !== undefined && (!Number.isInteger(options.maxSelections) || options.maxSelections < 1)) {
      throw new RangeError('maxSelections باید عدد صحیح بزرگ‌تر از صفر باشد.');
    }
    this.maxSelections = options.maxSelections;
    this.disabledDates = new Set((options.disabledDates ?? []).map((date) => DateValidator.assertString(date)));
  }

  add(date: string): boolean {
    const normalized = this.assertAllowed(date);
    if (this.dates.has(normalized)) return false;
    if (this.maxSelections !== undefined && this.dates.size >= this.maxSelections) {
      throw new RangeError(`حداکثر ${this.maxSelections} تاریخ قابل انتخاب است.`);
    }
    this.dates.add(normalized);
    return true;
  }

  addMany(dates: string[]): number {
    let added = 0;
    for (const date of dates) if (this.add(date)) added += 1;
    return added;
  }

  setAll(dates: string[]): void {
    const next = new MultiDateSelector({
      minDate: this.minDate,
      maxDate: this.maxDate,
      disabledDates: [...this.disabledDates],
      maxSelections: this.maxSelections,
    });
    next.addMany(dates);
    this.dates = new Set(next.getAll());
  }

  remove(date: string): boolean {
    return this.dates.delete(DateValidator.assertString(date));
  }

  toggle(date: string): boolean {
    const normalized = this.assertAllowed(date);
    if (this.dates.has(normalized)) {
      this.dates.delete(normalized);
      return false;
    }
    this.add(normalized);
    return true;
  }

  has(date: string): boolean {
    return this.dates.has(DateValidator.assertString(date));
  }

  count(): number {
    return this.dates.size;
  }

  getAll(): string[] {
    return [...this.dates].sort();
  }

  setDisabledDates(dates: string[]): void {
    this.disabledDates = new Set(dates.map((date) => DateValidator.assertString(date)));
    for (const date of [...this.dates]) {
      if (this.disabledDates.has(date)) this.dates.delete(date);
    }
  }

  getDisabledDates(): string[] {
    return [...this.disabledDates].sort();
  }

  clear(): void {
    this.dates.clear();
  }

  private assertAllowed(value: string): string {
    const date = DateValidator.assertString(value);
    if (this.minDate && date < this.minDate) throw new RangeError('تاریخ خارج از حداقل مجاز است.');
    if (this.maxDate && date > this.maxDate) throw new RangeError('تاریخ خارج از حداکثر مجاز است.');
    if (this.disabledDates.has(date)) throw new RangeError('تاریخ انتخابی غیرفعال است.');
    return date;
  }
}
