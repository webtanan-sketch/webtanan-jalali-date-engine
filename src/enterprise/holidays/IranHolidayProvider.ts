import type { Holiday, HolidayProvider } from '../HolidayEngine';

interface FixedSolarHoliday {
  month: number;
  day: number;
  title: string;
  id: string;
}

const FIXED_SOLAR_HOLIDAYS: FixedSolarHoliday[] = [
  { month: 1, day: 1, title: 'نوروز', id: 'iran-nowruz-1' },
  { month: 1, day: 2, title: 'نوروز', id: 'iran-nowruz-2' },
  { month: 1, day: 3, title: 'نوروز', id: 'iran-nowruz-3' },
  { month: 1, day: 4, title: 'نوروز', id: 'iran-nowruz-4' },
  { month: 1, day: 12, title: 'روز جمهوری اسلامی ایران', id: 'iran-republic-day' },
  { month: 1, day: 13, title: 'روز طبیعت', id: 'iran-nature-day' },
  { month: 3, day: 14, title: 'رحلت امام خمینی', id: 'iran-khomeini-memorial' },
  { month: 3, day: 15, title: 'قیام ۱۵ خرداد', id: 'iran-15-khordad' },
  { month: 11, day: 22, title: 'پیروزی انقلاب اسلامی ایران', id: 'iran-revolution-day' },
  { month: 12, day: 29, title: 'روز ملی شدن صنعت نفت ایران', id: 'iran-oil-nationalization' },
];

export interface MovableIranHoliday {
  month: number;
  day: number;
  title: string;
  id: string;
  description?: string;
}

export interface IranHolidayProviderOptions {
  /**
   * تعطیلات قمری/متحرک باید برای هر سال از منبع تقویم رسمی همان سال وارد شوند.
   * این Provider عمداً تاریخ متحرک را حدس نمی‌زند.
   */
  movable?: Record<number, MovableIranHoliday[]>;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export class IranHolidayProvider implements HolidayProvider {
  readonly name = 'Iran Official Holidays';
  readonly version = '0.6.0-fixed-solar-v1';

  constructor(private readonly options: IranHolidayProviderOptions = {}) {}

  getHolidays(year: number): Holiday[] {
    if (!Number.isInteger(year) || year < 1) throw new RangeError('سال شمسی نامعتبر است.');

    const fixed: Holiday[] = FIXED_SOLAR_HOLIDAYS.map((holiday) => ({
      id: holiday.id,
      date: `${year}/${pad(holiday.month)}/${pad(holiday.day)}`,
      title: holiday.title,
      type: 'official',
      source: 'fixed-solar',
    }));

    const movable: Holiday[] = (this.options.movable?.[year] ?? []).map((holiday) => ({
      id: holiday.id,
      date: `${year}/${pad(holiday.month)}/${pad(holiday.day)}`,
      title: holiday.title,
      type: 'official',
      source: 'movable',
      description: holiday.description,
    }));

    return [...fixed, ...movable];
  }
}

export const IRAN_FIXED_SOLAR_HOLIDAYS = Object.freeze(
  FIXED_SOLAR_HOLIDAYS.map((holiday) => ({ ...holiday })),
);
