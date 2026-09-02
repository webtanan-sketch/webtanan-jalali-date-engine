export type EventType = 'call' | 'meeting' | 'delivery' | 'payment' | 'followup';

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: EventType;
  user?: string;
  description?: string;
}

export class EventEngine {
  private events: CalendarEvent[] = [];

  add(event: CalendarEvent): void {
    this.events.push(event);
  }

  getByDate(date: string): CalendarEvent[] {
    return this.events.filter(item => item.date === date);
  }

  clear(): void {
    this.events = [];
  }
}
