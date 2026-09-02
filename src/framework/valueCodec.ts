import type { WebtananDatePickerOptions } from '../ui/WebtananDatePicker';
import { WebtananDatePicker } from '../ui/WebtananDatePicker';

export type FrameworkPickerMode = 'single' | 'range' | 'multiple';

export function modeFromOptions(options: Partial<WebtananDatePickerOptions> = {}): FrameworkPickerMode {
  if (options.range && options.multiple) throw new Error('range و multiple نمی‌توانند هم‌زمان فعال باشند.');
  if (options.range) return 'range';
  if (options.multiple) return 'multiple';
  return 'single';
}

export function applyPickerValue(
  picker: WebtananDatePicker,
  value: string | null | undefined,
  options: Partial<WebtananDatePickerOptions> = {},
): void {
  const normalized = value?.trim();
  if (!normalized) {
    picker.clear();
    return;
  }

  const mode = modeFromOptions(options);
  if (mode === 'multiple') {
    picker.setMultipleDates(normalized.split(',').map((item) => item.trim()).filter(Boolean));
    return;
  }

  if (mode === 'range') {
    const [start, end] = normalized.split('..', 2).map((item) => item.trim());
    if (!start || !end) throw new RangeError('مقدار Range باید به فرم start..end باشد.');
    picker.setRange(start, end);
    return;
  }

  const [date, time] = normalized.split(/\s+/, 2);
  picker.setDate(date);
  if (time && options.time) {
    const parts = time.split(':').map(Number);
    picker.setTime(parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0);
  }
}

export function readPickerValue(
  picker: WebtananDatePicker,
  options: Partial<WebtananDatePickerOptions> = {},
): string {
  const mode = modeFromOptions(options);
  if (mode === 'multiple') return picker.getMultipleDates().join(',');
  if (mode === 'range') {
    const range = picker.getRange();
    return range ? `${range.start}..${range.end}` : '';
  }
  return picker.getDateTime() ?? '';
}
