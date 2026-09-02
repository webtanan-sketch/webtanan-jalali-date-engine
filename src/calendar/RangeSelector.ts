export interface JalaliRange {
  start: string | null;
  end: string | null;
}

export class RangeSelector {
  private range: JalaliRange = { start: null, end: null };

  setStart(date: string): void {
    this.range.start = date;
    this.range.end = null;
  }

  setEnd(date: string): void {
    this.range.end = date;
  }

  getRange(): JalaliRange {
    return this.range;
  }

  clear(): void {
    this.range = { start: null, end: null };
  }
}
