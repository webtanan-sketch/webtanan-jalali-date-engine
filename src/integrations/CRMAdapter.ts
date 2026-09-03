import { JalaliConverter } from '../core/converter';

export interface CRMCustomerEvent {
  customer: string;
  date: string;
  title: string;
  type: string;
  time?: string;
  user?: string;
  description?: string;
}

export interface CRMCustomerRecord extends CRMCustomerEvent {
  id: string;
  gregorianDate: string;
  createdAt: string;
}

const parseDate = (value: string) => {
  const match = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(value.trim());
  if (!match) throw new RangeError('فرمت تاریخ CRM نامعتبر است.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!JalaliConverter.isValid(date)) throw new RangeError('تاریخ شمسی CRM نامعتبر است.');
  return date;
};

export class CRMAdapter {
  private records: CRMCustomerRecord[] = [];
  private sequence = 0;

  addFollowUp(item: CRMCustomerEvent): CRMCustomerRecord {
    if (!item.customer.trim()) throw new Error('نام یا شناسه مشتری الزامی است.');
    if (!item.title.trim()) throw new Error('عنوان پیگیری الزامی است.');
    const jalali = parseDate(item.date);
    const record: CRMCustomerRecord = {
      ...item,
      customer: item.customer.trim(),
      date: JalaliConverter.format(jalali),
      title: item.title.trim(),
      id: `crm-${++this.sequence}`,
      gregorianDate: JalaliConverter.toGregorianISO(jalali),
      createdAt: new Date().toISOString(),
    };
    this.records.push(record);
    return { ...record };
  }

  /** سازگاری با API قدیمی: فقط فیلدهای ورودی Timeline را برمی‌گرداند. */
  getCustomerTimeline(customer: string): CRMCustomerEvent[] {
    return this.records
      .filter((item) => item.customer === customer)
      .map(({ customer: name, date, title, type, time, user, description }) => ({
        customer: name,
        date,
        title,
        type,
        ...(time ? { time } : {}),
        ...(user ? { user } : {}),
        ...(description ? { description } : {}),
      }));
  }

  /** رکورد کامل برای ذخیره‌سازی سازمانی و Audit. */
  getCustomerRecords(customer: string): CRMCustomerRecord[] {
    return this.records
      .filter((item) => item.customer === customer)
      .map((item) => ({ ...item }));
  }

  getUpcoming(fromDate: string): CRMCustomerRecord[] {
    const normalized = JalaliConverter.format(parseDate(fromDate));
    return this.records
      .filter((item) => item.date >= normalized)
      .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))
      .map((item) => ({ ...item }));
  }

  remove(id: string): boolean {
    const index = this.records.findIndex((item) => item.id === id);
    if (index < 0) return false;
    this.records.splice(index, 1);
    return true;
  }

  clear(): void {
    this.records = [];
  }
}
