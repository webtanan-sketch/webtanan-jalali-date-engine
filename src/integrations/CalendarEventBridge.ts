import { DateValidator } from '../utils/DateValidator';

export interface CalendarBridgeEvent {
  date: string;
  title: string;
  [key: string]: unknown;
}

export class CalendarEventBridge<T extends CalendarBridgeEvent = CalendarBridgeEvent> {
  private events: T[] = [];

  add(event: T): T {
    if (!event.title.trim()) throw new Error('عنوان رویداد الزامی است.');
    const normalized = DateValidator.assertString(event.date);
    const created = { ...event, date: normalized } as T;
    this.events.push(created);
    return { ...created };
  }

  getByDate(date: string): T[] {
    const normalized = DateValidator.assertString(date);
    return this.events
      .filter((item) => item.date === normalized)
      .map((item) => ({ ...item }));
  }

  list(): T[] {
    return this.events.map((item) => ({ ...item }));
  }

  remove(predicate: (event: T) => boolean): number {
    const before = this.events.length;
    this.events = this.events.filter((event) => !predicate(event));
    return before - this.events.length;
  }

  clear(): void {
    this.events = [];
  }
}
