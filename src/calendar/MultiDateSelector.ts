export class MultiDateSelector {
  private dates: string[] = [];

  add(date: string): void {
    if (!this.dates.includes(date)) this.dates.push(date);
  }

  remove(date: string): void {
    this.dates = this.dates.filter(item => item !== date);
  }

  getAll(): string[] {
    return this.dates;
  }

  clear(): void {
    this.dates = [];
  }
}
