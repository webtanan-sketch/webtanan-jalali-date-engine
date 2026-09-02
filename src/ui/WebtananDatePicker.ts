import { KeyboardDateNavigator, type CalendarNavigationKey } from '../accessibility/KeyboardDateNavigator';
import { CalendarRenderer } from '../calendar/CalendarRenderer';
import { JalaliConverter } from '../core/converter';
import { DayStatusEngine, type DayStatus } from '../enterprise/DayStatusEngine';
import { HolidayEngine, type Holiday } from '../enterprise/HolidayEngine';
import { TimeSelector, type TimeValue } from '../time/TimeSelector';
import { PersianDigits } from '../utils/PersianDigits';

export interface WebtananDatePickerOptions {
  calendar: 'jalali';
  rtl: boolean;
  persianDigits: boolean;
  time: boolean;
  seconds: boolean;
  range: boolean;
  multiple: boolean;
  events: boolean;
  holidays: boolean;
  minuteStep: number;
  secondStep: number;
  minDate?: string;
  maxDate?: string;
  disabledDates: string[];
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

export interface WebtananDatePickerState {
  schemaVersion: 1;
  selectedDate: string | null;
  selectedRange: WebtananDateRange | null;
  selectedTime: TimeValue | null;
  events: WebtananCalendarEvent[];
  selectedDates?: string[];
}

const parseJalali = (value: string) => {
  const match = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت تاریخ باید مانند 1405/06/11 باشد.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!JalaliConverter.isValid(date)) throw new RangeError('تاریخ شمسی نامعتبر است.');
  return date;
};

const formatValue = (value: string): string => JalaliConverter.format(parseJalali(value));
const NAVIGATION_KEYS: CalendarNavigationKey[] = [
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End',
];

export class WebtananDatePicker {
  private options: WebtananDatePickerOptions;
  private selectedDate: string | null = null;
  private selectedRange: WebtananDateRange | null = null;
  private selectedDates = new Set<string>();
  private rangeAnchor: string | null = null;
  private disabledDates = new Set<string>();
  private events = new Map<string, WebtananCalendarEvent[]>();
  private renderer = new CalendarRenderer();
  private timeSelector: TimeSelector;
  private holidayEngine: HolidayEngine | null = null;
  private dayStatusEngine: DayStatusEngine | null = null;
  private root: HTMLElement | null = null;
  private viewYear: number;
  private viewMonth: number;

  constructor(options?: Partial<WebtananDatePickerOptions>) {
    this.options = {
      calendar: 'jalali',
      rtl: true,
      persianDigits: true,
      time: false,
      seconds: false,
      range: false,
      multiple: false,
      events: true,
      holidays: true,
      minuteStep: 15,
      secondStep: 1,
      disabledDates: [],
      ...options,
    };

    if (this.options.range && this.options.multiple) {
      throw new Error('حالت range و multiple نمی‌توانند هم‌زمان فعال باشند.');
    }

    this.disabledDates = new Set(this.options.disabledDates.map(formatValue));
    this.timeSelector = new TimeSelector({
      minuteStep: this.options.minuteStep,
      secondStep: this.options.secondStep,
      includeSeconds: this.options.seconds,
    });

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
    root.tabIndex = -1;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'انتخاب تاریخ شمسی');
    root.addEventListener('keydown', this.handleKeyDown);
    this.root = root;
    (host ?? document.body).appendChild(root);
    this.render();
    return root;
  }

  close(): void {
    this.root?.removeEventListener('keydown', this.handleKeyDown);
    this.root?.remove();
    this.root = null;
  }

  setDate(date: string): void {
    const normalized = formatValue(date);
    this.assertDateAllowed(normalized);
    this.applySelectedDate(normalized, false);
  }

  getDate(): string | null {
    return this.selectedDate;
  }

  setTime(hour: number, minute: number, second = 0): void {
    this.timeSelector.set(hour, minute, second);
    this.render();
  }

  getTime(): TimeValue | null {
    return this.timeSelector.get();
  }

  getFormattedTime(): string | null {
    return this.timeSelector.format();
  }

  getDateTime(): string | null {
    if (!this.selectedDate) return null;
    const time = this.timeSelector.format();
    return time ? `${this.selectedDate} ${time}` : this.selectedDate;
  }

  setRange(start: string, end: string): void {
    const normalizedStart = formatValue(start);
    const normalizedEnd = formatValue(end);
    this.assertDateAllowed(normalizedStart);
    this.assertDateAllowed(normalizedEnd);
    if (normalizedStart > normalizedEnd) throw new RangeError('تاریخ شروع نباید بعد از تاریخ پایان باشد.');
    this.assertRangeHasNoDisabledDate(normalizedStart, normalizedEnd);
    this.selectedRange = { start: normalizedStart, end: normalizedEnd };
    this.rangeAnchor = null;
    this.selectedDate = normalizedEnd;
    this.render();
  }

  getRange(): WebtananDateRange | null {
    return this.selectedRange ? { ...this.selectedRange } : null;
  }

  setMultipleDates(dates: string[]): void {
    if (!Array.isArray(dates)) throw new TypeError('dates باید آرایه باشد.');
    const next = new Set<string>();
    for (const date of dates) {
      const normalized = formatValue(date);
      this.assertDateAllowed(normalized);
      next.add(normalized);
    }
    this.selectedDates = next;
    this.selectedDate = [...next].sort().at(-1) ?? null;
    this.render();
  }

  getMultipleDates(): string[] {
    return [...this.selectedDates].sort();
  }

  toggleMultipleDate(date: string): boolean {
    const normalized = formatValue(date);
    this.assertDateAllowed(normalized);
    if (this.selectedDates.has(normalized)) {
      this.selectedDates.delete(normalized);
      if (this.selectedDate === normalized) this.selectedDate = [...this.selectedDates].sort().at(-1) ?? null;
      this.render();
      return false;
    }
    this.selectedDates.add(normalized);
    this.selectedDate = normalized;
    const parsed = parseJalali(normalized);
    this.viewYear = parsed.year;
    this.viewMonth = parsed.month;
    this.render();
    return true;
  }

  setDisabledDates(dates: string[]): void {
    const next = new Set<string>();
    for (const date of dates) next.add(formatValue(date));
    this.disabledDates = next;
    this.options.disabledDates = [...next];
    this.dropDisabledSelections();
    this.render();
  }

  getDisabledDates(): string[] {
    return [...this.disabledDates].sort();
  }

  isDateDisabled(date: string): boolean {
    const normalized = formatValue(date);
    return this.isOutsideBounds(normalized) || this.disabledDates.has(normalized);
  }

  setHolidayEngine(engine: HolidayEngine | null): void {
    this.holidayEngine = engine;
    this.render();
  }

  getHolidays(date: string): Holiday[] {
    if (!this.holidayEngine) return [];
    return this.holidayEngine.get(formatValue(date));
  }

  setDayStatusEngine(engine: DayStatusEngine | null): void {
    this.dayStatusEngine = engine;
    this.render();
  }

  getDayStatus(date: string): DayStatus {
    return this.dayStatusEngine?.get(formatValue(date)) ?? 'free';
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

  getAllEvents(): WebtananCalendarEvent[] {
    return [...this.events.values()].flat().map((event) => ({ ...event }));
  }

  exportState(): WebtananDatePickerState {
    const time = this.timeSelector.get();
    return {
      schemaVersion: 1,
      selectedDate: this.selectedDate,
      selectedRange: this.selectedRange ? { ...this.selectedRange } : null,
      selectedTime: time ? { ...time } : null,
      events: this.getAllEvents(),
      selectedDates: this.getMultipleDates(),
    };
  }

  importState(state: WebtananDatePickerState): void {
    if (!state || state.schemaVersion !== 1) throw new Error('نسخه state تقویم پشتیبانی نمی‌شود.');

    const nextDate = state.selectedDate ? formatValue(state.selectedDate) : null;
    if (nextDate) this.assertDateAllowed(nextDate);

    let nextRange: WebtananDateRange | null = null;
    if (state.selectedRange) {
      const start = formatValue(state.selectedRange.start);
      const end = formatValue(state.selectedRange.end);
      this.assertDateAllowed(start);
      this.assertDateAllowed(end);
      if (start > end) throw new RangeError('بازه ذخیره‌شده نامعتبر است.');
      this.assertRangeHasNoDisabledDate(start, end);
      nextRange = { start, end };
    }

    const nextDates = new Set<string>();
    for (const date of state.selectedDates ?? []) {
      const normalized = formatValue(date);
      this.assertDateAllowed(normalized);
      nextDates.add(normalized);
    }

    const nextEvents = new Map<string, WebtananCalendarEvent[]>();
    for (const event of state.events ?? []) {
      const date = formatValue(event.date);
      const current = nextEvents.get(date) ?? [];
      current.push({ ...event, date });
      nextEvents.set(date, current);
    }

    this.timeSelector.clear();
    if (state.selectedTime) {
      this.timeSelector.set(state.selectedTime.hour, state.selectedTime.minute, state.selectedTime.second);
    }

    this.selectedDate = nextDate;
    this.selectedRange = nextRange;
    this.selectedDates = nextDates;
    this.rangeAnchor = null;
    this.events = nextEvents;

    const focusDate = nextDate ?? nextRange?.start ?? [...nextDates].sort().at(-1) ?? null;
    if (focusDate) {
      const parsed = parseJalali(focusDate);
      this.viewYear = parsed.year;
      this.viewMonth = parsed.month;
    }
    this.render();
  }

  clear(): void {
    this.selectedDate = null;
    this.selectedRange = null;
    this.selectedDates.clear();
    this.rangeAnchor = null;
    this.timeSelector.clear();
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

  private applySelectedDate(date: string, emit: boolean): void {
    this.selectedDate = date;
    const parsed = parseJalali(date);
    this.viewYear = parsed.year;
    this.viewMonth = parsed.month;
    if (emit) this.dispatchChange();
    this.render();
  }

  private selectByMode(date: string): void {
    this.assertDateAllowed(date);

    if (this.options.multiple) {
      if (this.selectedDates.has(date)) this.selectedDates.delete(date);
      else this.selectedDates.add(date);
      this.selectedDate = date;
      this.dispatchChange();
      this.render();
      return;
    }

    if (this.options.range) {
      if (!this.rangeAnchor) {
        this.rangeAnchor = date;
        this.selectedRange = { start: date, end: date };
        this.selectedDate = date;
      } else {
        const start = this.rangeAnchor <= date ? this.rangeAnchor : date;
        const end = this.rangeAnchor <= date ? date : this.rangeAnchor;
        this.assertRangeHasNoDisabledDate(start, end);
        this.selectedRange = { start, end };
        this.selectedDate = date;
        this.rangeAnchor = null;
      }
      this.dispatchChange();
      this.render();
      return;
    }

    this.applySelectedDate(date, true);
  }

  private dropDisabledSelections(): void {
    if (this.selectedDate && this.isDateDisabled(this.selectedDate)) this.selectedDate = null;
    for (const date of [...this.selectedDates]) {
      if (this.isDateDisabled(date)) this.selectedDates.delete(date);
    }
    if (this.selectedRange) {
      try {
        this.assertRangeHasNoDisabledDate(this.selectedRange.start, this.selectedRange.end);
      } catch {
        this.selectedRange = null;
        this.rangeAnchor = null;
      }
    }
  }

  private isOutsideBounds(date: string): boolean {
    if (this.options.minDate && date < formatValue(this.options.minDate)) return true;
    if (this.options.maxDate && date > formatValue(this.options.maxDate)) return true;
    return false;
  }

  private assertDateAllowed(date: string): void {
    if (this.isOutsideBounds(date)) throw new RangeError('تاریخ انتخابی خارج از محدوده مجاز است.');
    if (this.disabledDates.has(date)) throw new RangeError('تاریخ انتخابی غیرفعال است.');
  }

  private assertRangeHasNoDisabledDate(start: string, end: string): void {
    if (!this.disabledDates.size) return;
    for (const disabled of this.disabledDates) {
      if (disabled >= start && disabled <= end) {
        throw new RangeError(`بازه شامل تاریخ غیرفعال ${disabled} است.`);
      }
    }
  }

  private focusDate(date: string): void {
    if (!this.root) return;
    this.root.querySelector<HTMLButtonElement>(`button[data-date="${date}"]`)?.focus();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    const target = event.target;
    if (target instanceof HTMLSelectElement || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
    if (!NAVIGATION_KEYS.includes(event.key as CalendarNavigationKey)) return;
    event.preventDefault();

    const base = this.selectedDate ? parseJalali(this.selectedDate) : { year: this.viewYear, month: this.viewMonth, day: 1 };
    const next = KeyboardDateNavigator.navigate(base, event.key as CalendarNavigationKey, this.options.rtl);
    const normalized = JalaliConverter.format(next);
    if (this.isDateDisabled(normalized)) return;
    this.applySelectedDate(normalized, true);
    this.focusDate(normalized);
  };

  private displayNumber(value: string | number): string {
    const text = String(value);
    return this.options.persianDigits ? PersianDigits.toPersian(text) : text;
  }

  private dispatchChange(): void {
    if (!this.root || typeof CustomEvent === 'undefined') return;
    this.root.dispatchEvent(new CustomEvent('webtanan-date-change', {
      bubbles: true,
      detail: {
        jalali: this.selectedDate,
        gregorian: this.selectedDate ? JalaliConverter.toGregorianISO(parseJalali(this.selectedDate)) : null,
        time: this.timeSelector.format(),
        dateTime: this.getDateTime(),
        range: this.getRange(),
        selectedDates: this.getMultipleDates(),
      },
    }));
  }

  private renderTimePicker(): HTMLElement | null {
    if (!this.options.time || typeof document === 'undefined') return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'webtanan-calendar__time';
    wrapper.setAttribute('aria-label', 'انتخاب زمان');
    const current = this.timeSelector.get() ?? { hour: 0, minute: 0, second: 0 };

    const makeSelect = (label: string, values: number[], selected: number): HTMLSelectElement => {
      const select = document.createElement('select');
      select.className = 'webtanan-calendar__time-select';
      select.setAttribute('aria-label', label);
      for (const value of values) {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = this.displayNumber(String(value).padStart(2, '0'));
        option.selected = value === selected;
        select.appendChild(option);
      }
      return select;
    };

    const hours = makeSelect('ساعت', Array.from({ length: 24 }, (_, index) => index), current.hour);
    const minutes = makeSelect('دقیقه', this.timeSelector.getMinuteOptions(), current.minute);
    const secondsValues: number[] = [];
    for (let value = 0; value < 60; value += this.options.secondStep) secondsValues.push(value);
    const seconds = this.options.seconds ? makeSelect('ثانیه', secondsValues, current.second) : null;

    const updateTime = () => {
      this.timeSelector.set(Number(hours.value), Number(minutes.value), seconds ? Number(seconds.value) : 0);
      this.dispatchChange();
    };
    hours.addEventListener('change', updateTime);
    minutes.addEventListener('change', updateTime);
    seconds?.addEventListener('change', updateTime);

    const hourLabel = document.createElement('span');
    hourLabel.textContent = 'ساعت';
    const minuteLabel = document.createElement('span');
    minuteLabel.textContent = 'دقیقه';
    wrapper.append(hourLabel, hours, minuteLabel, minutes);
    if (seconds) {
      const secondLabel = document.createElement('span');
      secondLabel.textContent = 'ثانیه';
      wrapper.append(secondLabel, seconds);
    }
    return wrapper;
  }

  private render(): void {
    if (!this.root || typeof document === 'undefined') return;
    const view = this.renderer.render(this.viewYear, this.viewMonth);
    const today = JalaliConverter.format(JalaliConverter.fromGregorianDate(new Date()));
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
    title.setAttribute('aria-live', 'polite');
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
    weekdays.setAttribute('aria-hidden', 'true');
    for (const weekday of view.weekDays) {
      const item = document.createElement('span');
      item.textContent = weekday;
      weekdays.appendChild(item);
    }

    const days = document.createElement('div');
    days.className = 'webtanan-calendar__days';
    days.setAttribute('role', 'grid');
    days.setAttribute('aria-label', `${view.monthName} ${view.year}`);

    const availableDates = view.cells
      .map((cell) => cell.date)
      .filter((date): date is string => Boolean(date) && !this.isDateDisabled(date as string));
    const selectedInView = this.selectedDate && availableDates.includes(this.selectedDate) ? this.selectedDate : null;
    const todayInView = availableDates.includes(today) ? today : null;
    const focusTarget = selectedInView ?? todayInView ?? availableDates[0] ?? null;

    for (const cell of view.cells) {
      if (!cell.date || cell.day === null) {
        const empty = document.createElement('span');
        empty.className = 'webtanan-calendar__day is-empty';
        empty.setAttribute('role', 'presentation');
        days.appendChild(empty);
        continue;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'webtanan-calendar__day';
      button.dataset.date = cell.date;
      button.setAttribute('role', 'gridcell');
      button.textContent = this.displayNumber(cell.day);

      const singleSelected = cell.date === this.selectedDate;
      const multipleSelected = this.selectedDates.has(cell.date);
      const inRange = Boolean(this.selectedRange && cell.date >= this.selectedRange.start && cell.date <= this.selectedRange.end);
      const selected = this.options.multiple ? multipleSelected : this.options.range ? inRange : singleSelected;
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      if (singleSelected && !this.options.multiple) button.classList.add('is-selected');
      if (multipleSelected) button.classList.add('is-multi-selected');
      if (inRange) button.classList.add('is-in-range');
      if (cell.date === today) button.setAttribute('aria-current', 'date');

      const eventTitles = this.events.get(cell.date)?.map((event) => event.title) ?? [];
      if (eventTitles.length) button.classList.add('has-event');

      const holidays = this.options.holidays && this.holidayEngine ? this.holidayEngine.get(cell.date) : [];
      if (holidays.length) button.classList.add('is-holiday');

      const status = this.dayStatusEngine?.get(cell.date) ?? 'free';
      button.dataset.status = status;
      if (status !== 'free') button.classList.add(`status-${status}`);

      const metadata = [
        ...eventTitles,
        ...holidays.map((holiday) => holiday.title),
        status !== 'free' ? `وضعیت: ${status}` : '',
      ].filter(Boolean);
      button.title = metadata.join('، ');
      button.setAttribute('aria-label', `${this.displayNumber(cell.day)} ${view.monthName} ${this.displayNumber(view.year)}${metadata.length ? `، ${metadata.join('، ')}` : ''}`);

      const disabled = this.isDateDisabled(cell.date) || status === 'closed';
      button.disabled = disabled;
      button.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      button.tabIndex = !disabled && cell.date === focusTarget ? 0 : -1;

      button.addEventListener('click', () => {
        this.selectByMode(cell.date as string);
        this.focusDate(cell.date as string);
      });
      days.appendChild(button);
    }

    this.root.append(header, weekdays, days);
    const timePicker = this.renderTimePicker();
    if (timePicker) this.root.appendChild(timePicker);
  }
}

export default WebtananDatePicker;
