export type JalaliDateValue = { year: number; month: number; day: number };
export type GregorianDateValue = { year: number; month: number; day: number };

const JALALI_BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181,
  1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
] as const;

const MIN_JALALI_YEAR = 1;
const MAX_JALALI_YEAR = JALALI_BREAKS[JALALI_BREAKS.length - 1] - 1;

const div = (a: number, b: number): number => Math.trunc(a / b);
const mod = (a: number, b: number): number => a - div(a, b) * b;

const isGregorianLeapYear = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const daysInGregorianMonth = (year: number, month: number): number => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return 0;
  if (month === 2) return isGregorianLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

const isValidGregorian = (date: GregorianDateValue): boolean => {
  if (!Number.isInteger(date.year) || !Number.isInteger(date.month) || !Number.isInteger(date.day)) return false;
  const max = daysInGregorianMonth(date.year, date.month);
  return max > 0 && date.day >= 1 && date.day <= max;
};

interface JalaliCalculation {
  leap: number;
  gregorianYear: number;
  marchDay: number;
}

/**
 * محاسبه سال جلالی با نقاط شکست تقویم رسمی ایران.
 * leap === 0 یعنی سال جلالی کبیسه است.
 */
const jalaliCalculation = (year: number): JalaliCalculation => {
  const firstBreak: number = JALALI_BREAKS[0];
  const lastBreak: number = JALALI_BREAKS[JALALI_BREAKS.length - 1];
  if (!Number.isInteger(year) || year < firstBreak || year >= lastBreak) {
    throw new RangeError(`سال شمسی خارج از محدوده پشتیبانی است: ${year}`);
  }

  const gregorianYear = year + 621;
  let leapJalali = -14;
  let previousBreak: number = firstBreak;
  let jump = 0;

  for (let index = 1; index < JALALI_BREAKS.length; index += 1) {
    const currentBreak: number = JALALI_BREAKS[index];
    jump = currentBreak - previousBreak;
    if (year < currentBreak) break;
    leapJalali += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    previousBreak = currentBreak;
  }

  let offset = year - previousBreak;
  leapJalali += div(offset, 33) * 8 + div(mod(offset, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - offset === 4) leapJalali += 1;

  const leapGregorian =
    div(gregorianYear, 4) - div((div(gregorianYear, 100) + 1) * 3, 4) - 150;
  const marchDay = 20 + leapJalali - leapGregorian;

  if (jump - offset < 6) {
    offset = offset - jump + div(jump + 4, 33) * 33;
  }

  let leap = mod(mod(offset + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gregorianYear, marchDay };
};

const gregorianToDayNumber = ({ year, month, day }: GregorianDateValue): number => {
  let value =
    div((year + div(month - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(month + 9, 12) + 2, 5) +
    day -
    34840408;
  value =
    value - div(div(year + 100100 + div(month - 8, 6), 100) * 3, 4) + 752;
  return value;
};

const dayNumberToGregorian = (dayNumber: number): GregorianDateValue => {
  let value = 4 * dayNumber + 139361631;
  value =
    value + div(div(4 * dayNumber + 183187720, 146097) * 3, 4) * 4 - 3908;
  const intermediate = div(mod(value, 1461), 4) * 5 + 308;
  const day = div(mod(intermediate, 153), 5) + 1;
  const month = mod(div(intermediate, 153), 12) + 1;
  const year = div(value, 1461) - 100100 + div(8 - month, 6);
  return { year, month, day };
};

const jalaliToDayNumber = ({ year, month, day }: JalaliDateValue): number => {
  const calculation = jalaliCalculation(year);
  return (
    gregorianToDayNumber({
      year: calculation.gregorianYear,
      month: 3,
      day: calculation.marchDay,
    }) +
    (month - 1) * 31 -
    div(month, 7) * (month - 7) +
    day -
    1
  );
};

const dayNumberToJalali = (dayNumber: number): JalaliDateValue => {
  const gregorian = dayNumberToGregorian(dayNumber);
  let year = gregorian.year - 621;
  const calculation = jalaliCalculation(year);
  const firstFarvardin = gregorianToDayNumber({
    year: gregorian.year,
    month: 3,
    day: calculation.marchDay,
  });
  let offset = dayNumber - firstFarvardin;

  if (offset >= 0) {
    if (offset <= 185) {
      return {
        year,
        month: 1 + div(offset, 31),
        day: mod(offset, 31) + 1,
      };
    }
    offset -= 186;
  } else {
    year -= 1;
    offset += 179;
    if (calculation.leap === 1) offset += 1;
  }

  return {
    year,
    month: 7 + div(offset, 30),
    day: mod(offset, 30) + 1,
  };
};

const daysInJalaliMonth = (year: number, month: number): number => {
  if (!Number.isInteger(year) || year < MIN_JALALI_YEAR || year > MAX_JALALI_YEAR) return 0;
  if (!Number.isInteger(month) || month < 1 || month > 12) return 0;
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return jalaliCalculation(year).leap === 0 ? 30 : 29;
};

export const JalaliConverter = {
  supportedYears: {
    min: MIN_JALALI_YEAR,
    max: MAX_JALALI_YEAR,
  } as const,

  isLeapYear(year: number): boolean {
    if (!Number.isInteger(year) || year < MIN_JALALI_YEAR || year > MAX_JALALI_YEAR) {
      throw new RangeError(`سال شمسی خارج از محدوده پشتیبانی است: ${year}`);
    }
    return jalaliCalculation(year).leap === 0;
  },

  daysInMonth(year: number, month: number): number {
    return daysInJalaliMonth(year, month);
  },

  isValid(date: JalaliDateValue): boolean {
    if (!Number.isInteger(date.year) || !Number.isInteger(date.month) || !Number.isInteger(date.day)) return false;
    const max = daysInJalaliMonth(date.year, date.month);
    return max > 0 && date.day >= 1 && date.day <= max;
  },

  isValidGregorian(date: GregorianDateValue): boolean {
    return isValidGregorian(date);
  },

  format(date: JalaliDateValue, separator = '/'): string {
    if (!this.isValid(date)) throw new RangeError('تاریخ شمسی نامعتبر است.');
    return `${String(date.year).padStart(4, '0')}${separator}${String(date.month).padStart(2, '0')}${separator}${String(date.day).padStart(2, '0')}`;
  },

  toGregorian(date: JalaliDateValue): GregorianDateValue {
    if (!this.isValid(date)) throw new RangeError('تاریخ شمسی نامعتبر است.');
    return dayNumberToGregorian(jalaliToDayNumber(date));
  },

  toGregorianISO(date: JalaliDateValue): string {
    const result = this.toGregorian(date);
    return `${String(result.year).padStart(4, '0')}-${String(result.month).padStart(2, '0')}-${String(result.day).padStart(2, '0')}`;
  },

  toJalali(date: GregorianDateValue): JalaliDateValue {
    if (!isValidGregorian(date)) throw new RangeError('تاریخ میلادی نامعتبر است.');
    const result = dayNumberToJalali(gregorianToDayNumber(date));
    if (result.year < MIN_JALALI_YEAR || result.year > MAX_JALALI_YEAR) {
      throw new RangeError('تاریخ میلادی خارج از محدوده تقویم شمسی پشتیبانی‌شده است.');
    }
    return result;
  },

  fromGregorianDate(date: Date): JalaliDateValue {
    if (Number.isNaN(date.getTime())) throw new RangeError('شیء Date نامعتبر است.');
    return this.toJalali({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    });
  },
};
