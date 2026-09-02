export type GFTEventType =
  | 'تماس با مشتری'
  | 'جلسه'
  | 'تحویل سفارش'
  | 'پرداخت'
  | 'پیگیری';

export interface GFTCalendarEvent {
  date: string;
  title: string;
  type: GFTEventType;
  user?: string;
  description?: string;
}

export class EventManager {
  private events: GFTCalendarEvent[] = [];

  add(event: GFTCalendarEvent): void {
    this.events.push(event);
  }

  getByDate(date: string): GFTCalendarEvent[] {
    return this.events.filter(item => item.date === date);
  }

  clear(): void {
    this.events = [];
  }
}
