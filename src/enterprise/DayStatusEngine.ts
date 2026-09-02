export type DayStatus = 'free' | 'work' | 'meeting' | 'holiday' | 'closed';

export class DayStatusEngine {
  private statuses: Record<string, DayStatus> = {};

  set(date: string, status: DayStatus) {
    this.statuses[date] = status;
  }

  get(date: string): DayStatus {
    return this.statuses[date] || 'free';
  }

  clear(date: string) {
    delete this.statuses[date];
  }
}
