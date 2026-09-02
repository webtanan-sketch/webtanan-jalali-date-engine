export type Holiday = {
  date: string;
  title: string;
  type: 'official' | 'company';
};

export class HolidayEngine {
  private holidays: Holiday[] = [];

  add(holiday: Holiday) {
    this.holidays.push(holiday);
  }

  isHoliday(date: string): boolean {
    return this.holidays.some(item => item.date === date);
  }

  get(date: string): Holiday[] {
    return this.holidays.filter(item => item.date === date);
  }
}
