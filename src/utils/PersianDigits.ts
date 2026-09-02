const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const reverseDigits: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => digits[Number(digit)]);
}

export function toEnglishDigits(value: string | number): string {
  return String(value).replace(/[۰-۹٠-٩]/g, (digit) => reverseDigits[digit] ?? digit);
}

export const PersianDigits = {
  toPersian: toPersianDigits,
  toEnglish: toEnglishDigits,
};
