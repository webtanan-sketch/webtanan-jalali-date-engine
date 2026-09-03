import { DateValidator } from '../utils/DateValidator';

export interface InteractiveCalendarOptions {
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
}

export interface InteractiveSelection {
  jalali: string;
  gregorian: string;
}

export class InteractiveCalendar {
  private selectedDate: string | null = null;
  private minDate?: string;
  private maxDate?: string;
  private disabledDates = new Set<string>();

  constructor(options: InteractiveCalendarOptions = {}) {
    this.minDate = options.minDate ? DateValidator.assertString(options.minDate) : undefined;
    this.maxDate = options.maxDate ? DateValidator.assertString(options.maxDate) : undefined;
    if (this.minDate && this.maxDate && this.minDate > this.maxDate) {
      throw new RangeError('حداقل تاریخ نباید بعد از حداکثر تاریخ باشد.');
    }
    this.setDisabledDates(options.disabledDates ?? []);
  }

  select(date: string): string {
    const normalized = DateValidator.assertString(date);
    this.assertAllowed(normalized);
    this.selectedDate = normalized;
    return normalized;
  }

  selectWithMetadata(date: string): InteractiveSelection {
    const jalali = this.select(date);
    return { jalali, gregorian: DateValidator.toGregorianISO(jalali) };
  }

  getSelectedDate(): string | null {
    return this.selectedDate;
  }

  getSelectedGregorian(): string | null {
    return this.selectedDate ? DateValidator.toGregorianISO(this.selectedDate) : null;
  }

  isSelected(date: string): boolean {
    return this.selectedDate === DateValidator.assertString(date);
  }

  isDisabled(date: string): boolean {
    const normalized = DateValidator.assertString(date);
    return Boolean(
      (this.minDate && normalized < this.minDate)
      || (this.maxDate && normalized > this.maxDate)
      || this.disabledDates.has(normalized),
    );
  }

  setDisabledDates(dates: string[]): void {
    this.disabledDates = new Set(dates.map((date) => DateValidator.assertString(date)));
    if (this.selectedDate && this.isDisabled(this.selectedDate)) this.selectedDate = null;
  }

  getDisabledDates(): string[] {
    return [...this.disabledDates].sort();
  }

  setBounds(minDate?: string, maxDate?: string): void {
    const min = minDate ? DateValidator.assertString(minDate) : undefined;
    const max = maxDate ? DateValidator.assertString(maxDate) : undefined;
    if (min && max && min > max) throw new RangeError('حداقل تاریخ نباید بعد از حداکثر تاریخ باشد.');
    this.minDate = min;
    this.maxDate = max;
    if (this.selectedDate && this.isDisabled(this.selectedDate)) this.selectedDate = null;
  }

  clear(): void {
    this.selectedDate = null;
  }

  private assertAllowed(date: string): void {
    if (this.isDisabled(date)) throw new RangeError('تاریخ انتخابی غیرفعال یا خارج از محدوده است.');
  }
}
