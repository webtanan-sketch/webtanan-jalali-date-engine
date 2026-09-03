import { CalendarRenderer } from '../calendar/CalendarRenderer';
import { JalaliCalendar } from '../calendar/JalaliCalendar';
import { JalaliConverter } from '../core/converter';
import { ThemeManager, type WebtananThemeName } from '../theme/ThemeManager';
import { WorkTaskManager } from '../work/WorkTaskManager';
import type { WorkTaskInput, WorkTaskRecord } from '../work/WorkTask';

export interface BigWorkCalendarOptions {
  year?: number;
  month?: number;
  theme?: WebtananThemeName;
  maxVisibleTasksPerDay?: number;
  readonly?: boolean;
}

export interface BigWorkCalendarDayDetail {
  date: string;
  tasks: WorkTaskRecord[];
}

const eventName = 'webtanan-work-calendar-day';

export class BigWorkCalendar {
  private readonly renderer = new CalendarRenderer();
  private readonly tasks: WorkTaskManager;
  private readonly options: Required<Omit<BigWorkCalendarOptions, 'year' | 'month'>>;
  private year: number;
  private month: number;
  private host: HTMLElement | null = null;
  private root: HTMLElement | null = null;

  constructor(tasks = new WorkTaskManager(), options: BigWorkCalendarOptions = {}) {
    const today = new Date();
    const currentJalali = JalaliConverter.toJalali({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });
    this.tasks = tasks;
    this.year = options.year ?? currentJalali.year;
    this.month = options.month ?? currentJalali.month;
    this.options = {
      theme: options.theme ?? ThemeManager.defaultTheme,
      maxVisibleTasksPerDay: Math.max(1, options.maxVisibleTasksPerDay ?? 4),
      readonly: options.readonly ?? false,
    };
  }

  open(host: HTMLElement): HTMLElement {
    this.host = host;
    this.render();
    return this.root as HTMLElement;
  }

  close(): void {
    this.root?.remove();
    this.root = null;
    this.host = null;
  }

  setMonth(year: number, month: number): void {
    const { min, max } = JalaliConverter.supportedYears;
    if (!Number.isInteger(year) || year < min || year > max) {
      throw new RangeError(`سال شمسی باید بین ${min} تا ${max} باشد.`);
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError('ماه شمسی نامعتبر است.');
    this.year = year;
    this.month = month;
    this.render();
  }

  nextMonth(): void {
    if (this.month === 12) this.setMonth(this.year + 1, 1);
    else this.setMonth(this.year, this.month + 1);
  }

  previousMonth(): void {
    if (this.month === 1) this.setMonth(this.year - 1, 12);
    else this.setMonth(this.year, this.month - 1);
  }

  addTask(input: WorkTaskInput): WorkTaskRecord {
    if (this.options.readonly) throw new Error('تقویم در حالت فقط‌خواندنی است.');
    const task = this.tasks.add(input);
    this.render();
    return task;
  }

  updateTask(id: string, patch: Partial<WorkTaskInput>): WorkTaskRecord {
    if (this.options.readonly) throw new Error('تقویم در حالت فقط‌خواندنی است.');
    const task = this.tasks.update(id, patch);
    this.render();
    return task;
  }

  removeTask(id: string): boolean {
    if (this.options.readonly) throw new Error('تقویم در حالت فقط‌خواندنی است.');
    const removed = this.tasks.remove(id);
    if (removed) this.render();
    return removed;
  }

  getTaskManager(): WorkTaskManager {
    return this.tasks;
  }

  getCurrentMonth(): { year: number; month: number } {
    return { year: this.year, month: this.month };
  }

  private render(): void {
    if (!this.host) return;
    const view = this.renderer.render(this.year, this.month);
    const calendar = new JalaliCalendar(this.year, this.month);
    const root = document.createElement('section');
    root.className = 'webtanan-work-calendar';
    root.setAttribute('data-webtanan-theme', this.options.theme);
    ThemeManager.apply(root, this.options.theme);

    const header = document.createElement('header');
    header.className = 'webtanan-work-calendar__header';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'webtanan-work-calendar__nav';
    prev.textContent = 'ماه قبل';
    prev.addEventListener('click', () => this.previousMonth());

    const title = document.createElement('div');
    title.className = 'webtanan-work-calendar__title';
    const monthTitle = document.createElement('strong');
    monthTitle.textContent = `${calendar.getMonthName()} ${this.year}`;
    const monthMeta = document.createElement('span');
    monthMeta.textContent = `${this.tasks.query({
      from: `${this.year}/${String(this.month).padStart(2, '0')}/01`,
      to: `${this.year}/${String(this.month).padStart(2, '0')}/31`,
    }).length} کار ثبت‌شده`;
    title.append(monthTitle, monthMeta);

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'webtanan-work-calendar__nav';
    next.textContent = 'ماه بعد';
    next.addEventListener('click', () => this.nextMonth());
    header.append(prev, title, next);

    const weekdays = document.createElement('div');
    weekdays.className = 'webtanan-work-calendar__weekdays';
    view.weekDays.forEach((name) => {
      const cell = document.createElement('div');
      cell.textContent = name;
      weekdays.appendChild(cell);
    });

    const grid = document.createElement('div');
    grid.className = 'webtanan-work-calendar__grid';
    grid.setAttribute('role', 'grid');

    view.cells.forEach((cell) => {
      const day = document.createElement('article');
      day.className = `webtanan-work-calendar__day${cell.disabled ? ' is-empty' : ''}`;
      if (!cell.date || !cell.day) {
        day.setAttribute('aria-hidden', 'true');
        grid.appendChild(day);
        return;
      }
      day.setAttribute('role', 'gridcell');
      day.dataset.date = cell.date;
      const tasks = this.tasks.getByDate(cell.date);
      const dayHeader = document.createElement('div');
      dayHeader.className = 'webtanan-work-calendar__day-header';
      const dayNumber = document.createElement('span');
      dayNumber.className = 'webtanan-work-calendar__day-number';
      dayNumber.textContent = String(cell.day);
      const dayCount = document.createElement('span');
      dayCount.className = 'webtanan-work-calendar__day-count';
      dayCount.textContent = tasks.length ? `${tasks.length} کار` : '';
      dayHeader.append(dayNumber, dayCount);
      day.appendChild(dayHeader);

      const list = document.createElement('div');
      list.className = 'webtanan-work-calendar__tasks';
      tasks.slice(0, this.options.maxVisibleTasksPerDay).forEach((task) => list.appendChild(this.renderTask(task)));
      if (tasks.length > this.options.maxVisibleTasksPerDay) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'webtanan-work-calendar__more';
        more.textContent = `+${tasks.length - this.options.maxVisibleTasksPerDay} کار دیگر`;
        more.addEventListener('click', (event) => {
          event.stopPropagation();
          this.emitDay(cell.date as string, tasks);
        });
        list.appendChild(more);
      }
      day.appendChild(list);
      day.addEventListener('click', () => this.emitDay(cell.date as string, tasks));
      grid.appendChild(day);
    });

    root.append(header, weekdays, grid);
    this.host.replaceChildren(root);
    this.root = root;
  }

  private renderTask(task: WorkTaskRecord): HTMLElement {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `webtanan-work-calendar__task status-${task.status} priority-${task.priority}`;
    item.dataset.taskId = task.id;
    if (task.color) item.style.setProperty('--task-accent', task.color);

    if (task.time) {
      const time = document.createElement('span');
      time.className = 'webtanan-work-calendar__task-time';
      time.textContent = task.time;
      item.appendChild(time);
    }
    const taskTitle = document.createElement('span');
    taskTitle.className = 'webtanan-work-calendar__task-title';
    taskTitle.textContent = task.title;
    item.appendChild(taskTitle);
    if (task.assignee) {
      const assignee = document.createElement('span');
      assignee.className = 'webtanan-work-calendar__task-assignee';
      assignee.textContent = task.assignee;
      item.appendChild(assignee);
    }

    item.addEventListener('click', (event) => {
      event.stopPropagation();
      this.emitDay(task.dateJalali, this.tasks.getByDate(task.dateJalali));
    });
    return item;
  }

  private emitDay(date: string, tasks: WorkTaskRecord[]): void {
    this.root?.dispatchEvent(new CustomEvent<BigWorkCalendarDayDetail>(eventName, {
      detail: { date, tasks },
      bubbles: true,
    }));
  }

  static readonly dayEventName = eventName;
}
