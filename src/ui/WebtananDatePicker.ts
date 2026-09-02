import { CalendarRenderer } from '../calendar/CalendarRenderer';
import { JalaliConverter } from '../core/converter';
import { PersianDigits } from '../utils/PersianDigits';

export interface WebtananDatePickerOptions {
  calendar: 'jalali';
  rtl: boolean;
  persianDigits: boolean;
  time: boolean;
  range: boolean;
  events: boolean;
  holidays: boolean;
  minuteStep: number;
  minDate?: string;
  maxDate?: string;
}

export interface WebtananCalendarEvent {
  date: string;
  title: string;
  type?: string;
  user?: string;
  note?: string;
}

export interface WebtananDateRange {
  start: string;
  end: string;
}

const parseJalali = (value: string) => {
  const match = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت تاریخ باید مانند 1405/06/11 باشد.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!JalaliConverter.isValid(date)) throw new RangeError('تاریخ شمسی نامعتبر است.');
  return date;
};

const formatValue = (value: string): string => JalaliConverter.format(parseJalali(value));

export class WebtananDatePicker {
  private options: WebtananDatePickerOptions;
  private selectedDate: string | null = null;
  private selectedRange: WebtananDateRange | null = null;
  private events = new Map<string, WebtananCalendarEvent[]>();
  private renderer = new CalendarRenderer();
  private root: HTMLElement | null = null;
  private viewYear: number;
  private viewMonth: number;

  constructor(options?: Partial<WebtananDatePickerOptions>) {
    this.options = {
      calendar: 'jalali',
      rtl: true,
      persianDigits: true,
      time: false,
      range: false,
      events: true,
      holidays: true,
      minuteStep: 15,
      ...options,
    };

    if (this.options.minuteStep < 1 || this.options.minuteStep > 60) {
      throw new RangeError('گام دقیقه باید بین 1 تا 60 باشد.');
    }

    const today = JalaliConverter.fromGregorianDate(new Date());
    this.viewYear = today.year;
    this.viewMonth = today.month;
  }

  open(target?: HTMLElement | string): HTMLElement | null {
    if (typeof document === 'undefined') return null;

    this.close();
    const host = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    const root = document.createElement('section');
    root.className = 'webtanan-calendar';
    root.dir = this.options.rtl ? 'rtl' : 'ltr';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'انتخاب تاریخ شمسی');
    this.root = root;

    (host ?? document.body).appendChild(root);
    this.render();
    return root;
  }

  close(): void {
    this.root?.remove();
    this.root = null;
  }

  setDate(date: string): void {
    const normalized = formatValue(date);
    this.assertWithinBounds(normalized);
    this.selectedDate = normalized;
    const parsed = parseJalali(normalized);
    this.viewYear = parsed.year;
    this.viewMonth = parsed.month;
    this.render();
  }

  getDate(): string | null {
    return this.selectedDate;
  }

  setRange(start: string, end: string): void {
    const normalizedStart = formatValue(start);
    const normalizedEnd = formatValue(end);
    this.assertWithinBounds(normalizedStart);
    this.assertWithinBounds(normalizedEnd);
    if (normalizedStart > normalizedEnd) throw new RangeError('تاریخ شروع نباید بعد از تاریخ پایان باشد.');
    this.selectedRange = { start: normalizedStart, end: normalizedEnd };
    this.render();
  }

  getRange(): WebtananDateRange | null {
    return this.selectedRange ? { ...this.selectedRange } : null;
  }

  addEvent(event: WebtananCalendarEvent): void {
    const date = formatValue(event.date);
    const current = this.events.get(date) ?? [];
    current.push({ ...event, date });
    this.events.set(date, current);
    this.render();
  }

  getEvents(date: string): WebtananCalendarEvent[] {
    return [...(this.events.get(formatValue(date)) ?? [])];
  }

  clear(): void {
    this.selectedDate = null;
    this.selectedRange = null;
    this.render();
  }

  nextMonth(): void {
    this.viewMonth += 1;
    if (this.viewMonth > 12) {
      this.viewMonth = 1;
      this.viewYear += 1;
    }
    this.render();
  }

  previousMonth(): void {
    this.viewMonth -= 1;
    if (this.viewMonth < 1) {
      this.viewMonth = 12;
      this.viewYear -= 1;
    }
    this.render();
  }

  private assertWithinBounds(date: string): void {
    if (this.options.minDate && date < formatValue(this.options.minDate)) {
      throw new RangeError('تاریخ انتخابی قبل از حداقل تاریخ مجاز است.');
    }
    if (this.options.maxDate && date > formatValue(this.options.maxDate)) {
      throw new RangeError('تاریخ انتخابی بعد از حداکثر تاریخ مجاز است.');
    }
  }

  private displayNumber(value: string | number): string {
    const text = String(value);
    return this.options.persianDigits ? PersianDigits.toPersian(text) : text;
  }

  private render(): void {
    if (!this.root || typeof document === 'undefined') return;

    const view = this.renderer.render(this.viewYear, this.viewMonth);
    this.root.replaceChildren();

    const header = document.createElement('header');
    header.className = 'webtanan-calendar__header';

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'webtanan-calendar__nav';
    previous.setAttribute('aria-label', 'ماه قبل');
    previous.textContent = '‹';
    previous.addEventListener('click', () => this.previousMonth());

    const title = document.createElement('strong');
    title.className = 'webtanan-calendar__title';
    title.textContent = `${view.monthName} ${this.displayNumber(view.year)}`;

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'webtanan-calendar__nav';
    next.setAttribute('aria-label', 'ماه بعد');
    next.textContent = '›';
    next.addEventListener('click', () => this.nextMonth());

    header.append(previous, title, next);

    const weekdays = document.createElement('div');
    weekdays.className = 'webtanan-calendar__weekdays';
    for (const weekday of view.weekDays) {
      const item = document.createElement('span');
      item.textContent = weekday;
      weekdays.appendChild(item);
    }

    const days = document.createElement('div');
    days.className = 'webtanan-calendar__days';

    for (const cell of view.cells) {
      if (!cell.date || cell.day === null) {
        const empty = document.createElement('span');
        empty.className = 'webtanan-calendar__day is-empty';
        days.appendChild(empty);
        continue;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'webtanan-calendar__day';
      button.dataset.date = cell.date;
      button.textContent = this.displayNumber(cell.day);

      if (cell.date === this.selectedDate) button.classList.add('is-selected');
      if (this.selectedRange && cell.date >= this.selectedRange.start && cell.date <= this.selectedRange.end) {
        button.classList.add('is-in-range');
      }
      if (this.events.has(cell.date)) {
        button.classList.add('has-event');
        button.title = this.events.get(cell.date)?.map((event) => event.title).join('، ') ?? '';
      }

      const disabled =
        (this.options.minDate ? cell.date < formatValue(this.options.minDate) : false) ||
        (this.options.maxDate ? cell.date > formatValue(this.options.maxDate) : false);
      button.disabled = disabled;

      button.addEventListener('click', () => {
        this.selectedDate = cell.date;
        this.root?.dispatchEvent(
          new CustomEvent('webtanan-date-change', {
            bubbles: true,
            detail: {
              jalali: cell.date,
              gregorian: JalaliConverter.toGregorianISO(parseJalali(cell.date as string)),
            },
          }),
        );
        this.render();
      });

      days.appendChild(button);
    }

    this.root.append(header, weekdays, days);
  }
}

export default WebtananDatePicker;
