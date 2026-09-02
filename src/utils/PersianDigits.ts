export function toPersianDigits(value:string|number):string {
  const digits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(value).replace(/[0-9]/g, d => digits[Number(d)]);
}
