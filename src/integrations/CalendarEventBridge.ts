export class CalendarEventBridge {
  private events: any[] = [];

  add(event: any) {
    this.events.push(event);
  }

  getByDate(date: string) {
    return this.events.filter(item => item.date === date);
  }

  clear() {
    this.events = [];
  }
}
