export interface TimeValue {
  hour: number;
  minute: number;
  second: number;
}

export interface TimeSelectorOptions {
  minuteStep: number;
  secondStep: number;
  includeSeconds: boolean;
}

export class TimeSelector {
  private options: TimeSelectorOptions;
  private value: TimeValue | null = null;

  constructor(options?: Partial<TimeSelectorOptions>) {
    this.options = {
      minuteStep: 15,
      secondStep: 1,
      includeSeconds: false,
      ...options,
    };

    if (60 % this.options.minuteStep !== 0 || this.options.minuteStep < 1) {
      throw new RangeError('گام دقیقه باید مقسوم‌علیه 60 باشد.');
    }
    if (60 % this.options.secondStep !== 0 || this.options.secondStep < 1) {
      throw new RangeError('گام ثانیه باید مقسوم‌علیه 60 باشد.');
    }
  }

  set(hour: number, minute: number, second = 0): void {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new RangeError('ساعت نامعتبر است.');
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) throw new RangeError('دقیقه نامعتبر است.');
    if (!Number.isInteger(second) || second < 0 || second > 59) throw new RangeError('ثانیه نامعتبر است.');
    if (minute % this.options.minuteStep !== 0) throw new RangeError('دقیقه با گام زمانی تنظیم‌شده هماهنگ نیست.');
    if (second % this.options.secondStep !== 0) throw new RangeError('ثانیه با گام زمانی تنظیم‌شده هماهنگ نیست.');

    this.value = { hour, minute, second };
  }

  get(): TimeValue | null {
    return this.value ? { ...this.value } : null;
  }

  clear(): void {
    this.value = null;
  }

  format(value = this.value): string | null {
    if (!value) return null;
    const hh = String(value.hour).padStart(2, '0');
    const mm = String(value.minute).padStart(2, '0');
    const ss = String(value.second).padStart(2, '0');
    return this.options.includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  }

  getMinuteOptions(): number[] {
    const items: number[] = [];
    for (let minute = 0; minute < 60; minute += this.options.minuteStep) items.push(minute);
    return items;
  }
}
