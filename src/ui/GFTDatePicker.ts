export interface GFTDatePickerOptions {
  calendar: 'jalali';
  rtl: boolean;
  persianDigits: boolean;
  time: boolean;
  range: boolean;
  events: boolean;
}

export class GFTDatePicker {
  private options: GFTDatePickerOptions;
  private selectedDate: string | null = null;

  constructor(options?: Partial<GFTDatePickerOptions>) {
    this.options = {
      calendar: 'jalali',
      rtl: true,
      persianDigits: true,
      time: false,
      range: false,
      events: false,
      ...options
    };
  }

  open(): void {
    // UI renderer will attach calendar view
  }

  close(): void {
    // close calendar
  }

  setDate(date: string): void {
    this.selectedDate = date;
  }

  getDate(): string | null {
    return this.selectedDate;
  }

  clear(): void {
    this.selectedDate = null;
  }
}

export default GFTDatePicker;
