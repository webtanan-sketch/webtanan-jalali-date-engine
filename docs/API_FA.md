# API فارسی Webtanan Jalali Date Engine

این سند API عمومی موتور تاریخ شمسی وب‌تنان را توضیح می‌دهد. مسیرهای داخلی `src/...` قرارداد عمومی محسوب نمی‌شوند؛ مصرف‌کننده باید از خروجی اصلی پکیج یا Subpathهای رسمی استفاده کند.

---

## 1) هسته تاریخ شمسی

### `JalaliConverter`

```ts
import { JalaliConverter } from 'webtanan-jalali-date-engine';
```

API اصلی:

```ts
JalaliConverter.isLeapYear(1360)
JalaliConverter.daysInMonth(1403, 12)
JalaliConverter.isValid({ year: 1404, month: 12, day: 30 })
JalaliConverter.toGregorian({ year: 1405, month: 6, day: 11 })
JalaliConverter.toGregorianISO({ year: 1405, month: 6, day: 11 })
JalaliConverter.toJalali({ year: 2026, month: 9, day: 2 })
```

محدوده الگوریتم فعلی:

```ts
JalaliConverter.supportedYears.min // 1
JalaliConverter.supportedYears.max // 3177
```

تشخیص کبیسه برای تمام این بازه از خود الگوریتم انجام می‌شود و به دیتاست تعطیلات وابسته نیست.

### `JalaliYearEngine`

```ts
import { JalaliYearEngine, getJalaliYearInfo } from 'webtanan-jalali-date-engine';

JalaliYearEngine.isLeap(1360)
JalaliYearEngine.esfandDays(1360)
JalaliYearEngine.daysInYear(1360)

getJalaliYearInfo(1360)
```

خروجی `getJalaliYearInfo` شامل وضعیت کبیسه، تعداد روز سال، تعداد روز اسفند، اول فروردین و آخر سال به میلادی است.

---

## 2) اعتبارسنجی و اعداد فارسی

### `DateValidator`

```ts
DateValidator.normalize('۱۴۰۵/۶/۱۱') // 1405/06/11
DateValidator.toGregorianISO('1405/06/11') // 2026-09-02
DateValidator.compare('1405/06/10', '1405/06/11') // -1
```

### `PersianDigits`

```ts
PersianDigits.toPersian('1405')
PersianDigits.toEnglish('۱۴۰۵')
```

---

## 3) Date Picker

### `WebtananDatePicker`

```ts
const picker = new WebtananDatePicker({
  calendar: 'jalali',
  rtl: true,
  persianDigits: true,
  time: true,
  seconds: false,
  minuteStep: 15,
  range: false,
  multiple: false,
  events: true,
  holidays: true,
  theme: 'industrial-light',
  minDate: '1360/01/01',
  maxDate: '1500/12/29',
  disabledDates: [],
});
```

عملیات عمومی:

```ts
picker.open('#host')
picker.close()
picker.setDate('1405/06/11')
picker.getDate()
picker.setTime(14, 30)
picker.getTime()
picker.getDateTime()
picker.setRange('1405/06/01', '1405/06/10')
picker.getRange()
picker.setMultipleDates(['1405/06/01', '1405/06/10'])
picker.getMultipleDates()
picker.setDisabledDates(['1405/06/12'])
picker.setTheme('graphite-dark')
picker.getTheme()
picker.clear()
```

رویداد DOM:

```ts
host.addEventListener('webtanan-date-change', (event) => {
  console.log(event.detail);
});
```

`detail` شامل تاریخ شمسی، معادل میلادی، زمان، DateTime، Range و چندتاریخی است.

---

## 4) Theme System

تم‌های داخلی:

- `industrial-light` — صنعتی روشن
- `navy-command` — فرماندهی سرمه‌ای
- `steel-neutral` — فولادی خنثی
- `graphite-dark` — گرافیتی تیره

```ts
ThemeManager.list()
ThemeManager.apply(element, 'navy-command')
ThemeManager.applyCustomVariables(element, {
  accent: '#17365d',
  border: '#c9d4df',
})
```

CSS Themeها بر پایه Variable طراحی شده است و تغییر ظاهر منطق تقویم را تغییر نمی‌دهد.

---

## 5) تعطیلات ایران

دیتاست داخلی فعلی:

```ts
IRAN_OFFICIAL_DATASET_YEARS // [1404, 1405]
getIranOfficialHolidayDataset(1405)
```

### `HolidayEngine`

```ts
const holidays = new HolidayEngine();
const dataset = getIranOfficialHolidayDataset(1405);
if (dataset) holidays.load(dataset, 1405);

holidays.add({
  date: '1405/07/10',
  title: 'تعطیلی شرکت',
  type: 'company',
  source: 'company',
});

holidays.isHoliday('1405/07/10')
holidays.get('1405/07/10')
```

### `HolidayDatasetLoader`

برای سال‌های بعد، دیتاست JSON رسمی را بدون تغییر هسته بارگذاری می‌کند.

---

## 6) وضعیت روزها

### `DayStatusEngine`

```ts
const status = new DayStatusEngine();
status.set('1405/06/11', 'meeting');
status.set({
  date: '1405/06/12',
  status: 'closed',
  title: 'تعمیرات',
  user: 'مدیر کارخانه',
});

status.get('1405/06/12')
status.getRecord('1405/06/12')
status.getByStatus('closed')
status.setMany([...])
status.clearByStatus('meeting')
status.toJSON()
```

وضعیت‌ها:

`free | work | meeting | holiday | closed`

---

## 7) محاسبه روز کاری

### `BusinessDayCalculator`

جمعه به‌صورت پیش‌فرض تعطیل هفتگی است؛ این تنظیم قابل تغییر است.

```ts
const business = new BusinessDayCalculator({
  holidays,
  dayStatuses: status,
});

business.isBusinessDay('1405/06/11')
business.nextBusinessDay('1405/06/11')
business.previousBusinessDay('1405/06/11')
business.addBusinessDays('1405/06/11', 10)
business.countBusinessDays('1405/06/01', '1405/06/31')
```

---

## 8) Event Engine

```ts
const events = new EventEngine();
const record = events.add({
  id: 'evt-100',
  date: '1405/06/11',
  time: '09:30',
  title: 'جلسه مشتری',
  type: 'meeting',
  user: 'کارشناس فروش',
  description: 'بررسی قیمت',
});
```

رکورد خروجی به‌طور خودکار `gregorianDate` و `createdAt` دارد.

API:

```ts
events.update(id, patch)
events.getById(id)
events.getByDate(date)
events.list()
events.remove(id)
events.toJSON()
```

---

## 9) CRM Adapter

```ts
const crm = new CRMAdapter();
crm.addFollowUp({
  customer: 'رضا احمدی',
  date: '1405/06/11',
  title: 'پیگیری قیمت',
  type: 'followup',
  user: 'فروش',
});

crm.getCustomerTimeline('رضا احمدی')
crm.getCustomerRecords('رضا احمدی')
crm.getUpcoming('1405/06/01')
```

`getCustomerTimeline` برای سازگاری API ساده قبلی را نگه می‌دارد؛ `getCustomerRecords` رکورد کامل Audit را برمی‌گرداند.

---

## 10) گردش فروش

### `SalesWorkflowAdapter`

```ts
const sales = new SalesWorkflowAdapter();
sales.addStep({ stage: 'order', date: '1405/06/01', status: 'done' });
sales.addStep({ stage: 'approval', date: '1405/06/02', status: 'active' });

sales.getSteps()
sales.getCurrentStage()
sales.getProgress()
sales.isDelayed('1405/06/20', '1405/06/21')
sales.toJSON()
```

مراحل استاندارد:

`order → approval → production → loading → delivery`

---

## 11) گردش تولید

### `ProductionWorkflowAdapter`

```ts
const production = new ProductionWorkflowAdapter();
production.createOrder({
  id: 'P-100',
  product: 'کاشی استخری',
  quantity: 120,
  startDate: '1405/06/01',
  dueDate: '1405/06/20',
});

production.updateStage('P-100', 'production', {
  status: 'active',
  date: '1405/06/05',
  responsible: 'سرپرست تولید',
});

production.getProgress('P-100')
production.getCurrentStage('P-100')
production.isDelayed('P-100', '1405/06/21')
production.listOrders()
```

---

## 12) تقویم حسابداری

### `AccountingCalendarAdapter`

```ts
const accounting = new AccountingCalendarAdapter();
accounting.add({
  id: 'ACC-1',
  date: '1405/06/11',
  title: 'سررسید پرداخت',
  type: 'payment-due',
  amount: 25000000,
  user: 'حسابدار',
});

accounting.getByDate('1405/06/11')
accounting.getUpcoming('1405/06/01', '1405/06/31')
accounting.getPendingDues('1405/06/15')
accounting.sum('payment-due', 'pending')
```

نوع رکوردها:

`invoice | payment-due | payment-received | payroll | tax | period-closing`

---

## 13) Persistence و Storage

Adapterهای موجود:

- `MemoryStorageAdapter`
- `BrowserStorageAdapter`
- `DatabaseStorageAdapter`
- `RestStorageAdapter`
- `JsonRepository`
- `DatePickerPersistence`

PHP/Laravel نیز Storeهای PDO و Laravel Cache را دارد.

---

## 14) React و Vue

React:

```ts
import { WebtananJalaliDatePickerReact } from 'webtanan-jalali-date-engine/react';
```

Vue:

```ts
import { WebtananJalaliDatePickerVue } from 'webtanan-jalali-date-engine/vue';
```

React/Vue Peer Dependency اختیاری‌اند و هسته اصلی را سنگین نمی‌کنند.

---

## 15) Browser Bundle

بعد از build:

- `dist/browser/webtanan-jalali.js`
- `dist/browser/webtanan-jalali.min.js`
- `dist/browser/webtanan-jalali.css`

در حالت Script Tag، API زیر global قرار می‌گیرد:

```js
window.WebtananJalali
```

---

## قرارداد نسخه پایدار

تا قبل از `v1.0.0` ممکن است APIهای جدید اضافه شوند. حذف یا شکستن APIهای موجود باید فقط با مستندات Migration و تغییر نسخه اصلی انجام شود.
