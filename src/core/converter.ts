export type JalaliDateValue = { year: number; month: number; day: number };
export type GregorianDateValue = { year: number; month: number; day: number };

const PERSIAN_EPOCH = 1948320.5;
const GREGORIAN_EPOCH = 1721425.5;

const mod = (a: number, b: number): number => a - b * Math.floor(a / b);

const isGregorianLeapYear = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const gregorianToJd = ({ year, month, day }: GregorianDateValue): number => {
  const adjustment = month <= 2 ? 0 : isGregorianLeapYear(year) ? -1 : -2;
  return (
    GREGORIAN_EPOCH -
    1 +
    365 * (year - 1) +
    Math.floor((year - 1) / 4) -
    Math.floor((year - 1) / 100) +
    Math.floor((year - 1) / 400) +
    Math.floor((367 * month - 362) / 12 + adjustment + day)
  );
};

const jdToGregorian = (jd: number): GregorianDateValue => {
  const wjd = Math.floor(jd - 0.5) + 0.5;
  const depoch = wjd - GREGORIAN_EPOCH;
  const quadricent = Math.floor(depoch / 146097);
  const dqc = mod(depoch, 146097);
  const cent = Math.floor(dqc / 36524);
  const dcent = mod(dqc, 36524);
  const quad = Math.floor(dcent / 1461);
  const dquad = mod(dcent, 1461);
  const yindex = Math.floor(dquad / 365);

  let year = quadricent * 400 + cent * 100 + quad * 4 + yindex;
  if (!(cent === 4 || yindex === 4)) year += 1;

  const yearday = wjd - gregorianToJd({ year, month: 1, day: 1 });
  const leapadj = wjd < gregorianToJd({ year, month: 3, day: 1 }) ? 0 : isGregorianLeapYear(year) ? 1 : 2;
  const month = Math.floor(((yearday + leapadj) * 12 + 373) / 367);
  const day = Math.floor(wjd - gregorianToJd({ year, month, day: 1 }) + 1);

  return { year, month, day };
};

const jalaliToJd = ({ year, month, day }: JalaliDateValue): number => {
  const epbase = year - (year >= 0 ? 474 : 473);
  const epyear = 474 + mod(epbase, 2820);
  const mdays = month <= 7 ? (month - 1) * 31 : (month - 1) * 30 + 6;

  return (
    day +
    mdays +
    Math.floor((epyear * 682 - 110) / 2816) +
    (epyear - 1) * 365 +
    Math.floor(epbase / 2820) * 1029983 +
    (PERSIAN_EPOCH - 1)
  );
};

const jdToJalali = (jd: number): JalaliDateValue => {
  const normalized = Math.floor(jd) + 0.5;
  const depoch = normalized - jalaliToJd({ year: 475, month: 1, day: 1 });
  const cycle = Math.floor(depoch / 1029983);
  const cyear = mod(depoch, 1029983);

  let ycycle: number;
  if (cyear === 1029982) {
    ycycle = 2820;
  } else {
    const aux1 = Math.floor(cyear / 366);
    const aux2 = mod(cyear, 366);
    ycycle = Math.floor((2134 * aux1 + 2816 * aux2 + 2815) / 1028522) + aux1 + 1;
  }

  let year = ycycle + 2820 * cycle + 474;
  if (year <= 0) year -= 1;

  const yday = Math.floor(normalized - jalaliToJd({ year, month: 1, day: 1 }) + 1);
  const month = yday <= 186 ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
  const day = Math.floor(normalized - jalaliToJd({ year, month, day: 1 }) + 1);

  return { year, month, day };
};

const daysInJalaliMonth = (year: number, month: number): number => {
  if (month < 1 || month > 12) return 0;
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return JalaliConverter.isLeapYear(year) ? 30 : 29;
};

export const JalaliConverter = {
  isLeapYear(year: number): boolean {
    const start = jalaliToJd({ year, month: 1, day: 1 });
    const next = jalaliToJd({ year: year + 1, month: 1, day: 1 });
    return next - start === 366;
  },

  daysInMonth(year: number, month: number): number {
    return daysInJalaliMonth(year, month);
  },

  isValid(date: JalaliDateValue): boolean {
    if (!Number.isInteger(date.year) || !Number.isInteger(date.month) || !Number.isInteger(date.day)) return false;
    const max = daysInJalaliMonth(date.year, date.month);
    return max > 0 && date.day >= 1 && date.day <= max;
  },

  format(date: JalaliDateValue, separator = '/'): string {
    if (!this.isValid(date)) throw new RangeError('تاریخ شمسی نامعتبر است.');
    return `${String(date.year).padStart(4, '0')}${separator}${String(date.month).padStart(2, '0')}${separator}${String(date.day).padStart(2, '0')}`;
  },

  toGregorian(date: JalaliDateValue): GregorianDateValue {
    if (!this.isValid(date)) throw new RangeError('تاریخ شمسی نامعتبر است.');
    return jdToGregorian(jalaliToJd(date));
  },

  toGregorianISO(date: JalaliDateValue): string {
    const result = this.toGregorian(date);
    return `${String(result.year).padStart(4, '0')}-${String(result.month).padStart(2, '0')}-${String(result.day).padStart(2, '0')}`;
  },

  toJalali(date: GregorianDateValue): JalaliDateValue {
    if (date.month < 1 || date.month > 12 || date.day < 1 || date.day > 31) {
      throw new RangeError('تاریخ میلادی نامعتبر است.');
    }
    return jdToJalali(gregorianToJd(date));
  },

  fromGregorianDate(date: Date): JalaliDateValue {
    return this.toJalali({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    });
  },
};
