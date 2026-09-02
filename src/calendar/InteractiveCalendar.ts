export class InteractiveCalendar {
  private selectedDate: string | null = null;

  select(date: string) {
    this.selectedDate = date;
    return this.selectedDate;
  }

  getSelectedDate() {
    return this.selectedDate;
  }

  clear() {
    this.selectedDate = null;
  }
}
