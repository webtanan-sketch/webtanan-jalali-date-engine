import { JalaliConverter } from '../core/converter';
import { JalaliCalendar } from './JalaliCalendar';

export interface CalendarCell {
  day: number | null;
  date: string | null;
  disabled: boolean;
}

export interface CalendarView {
  year: number;
  month: number;
  monthName: string;
  weekDays: string[];
  firstWeekday: number;
  cells: CalendarCell[];
}

export class CalendarRenderer {
  private readonly weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

  render(year: number, month: number): CalendarView {
    const calendar = new JalaliCalendar(year, month);
    const gregorian = JalaliConverter.toGregorian({ year, month, day: 1 });
    const jsDay = new Date(Date.UTC(gregorian.year, gregorian.month - 1, gregorian.day)).getUTCDay();
    const firstWeekday = (jsDay + 1) % 7;
    const daysInMonth = calendar.getDaysInMonth();
    const cells: CalendarCell[] = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ day: null, date: null, disabled: true });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = JalaliConverter.format({ year, month, day });
      cells.push({ day, date, disabled: false });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ day: null, date: null, disabled: true });
    }

    return {
      year,
      month,
      monthName: calendar.getMonthName(),
      weekDays: [...this.weekDays],
      firstWeekday,
      cells,
    };
  }

  selectDay(year: number, month: number, day: number) {
    const date = { year, month, day };
    if (!JalaliConverter.isValid(date)) throw new RangeError('روز انتخاب‌شده معتبر نیست.');
    return { ...date, formatted: JalaliConverter.format(date) };
  }
}
