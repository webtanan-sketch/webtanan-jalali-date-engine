export type DayStatus =
  | 'free'
  | 'busy'
  | 'holiday'
  | 'meeting'
  | 'closed';

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type?: string;
  status?: DayStatus;
}

export interface GFTDatePickerOptions {
  calendar: 'jalali';
  rtl: boolean;
  persianDigits: boolean;
  time: boolean;
  range: boolean;
  events: boolean;
  holidays: boolean;
}
