# API فارسی Webtanan Jalali Date Engine

این سند قرارداد عمومی **Webtanan Jalali Date Engine** را توضیح می‌دهد. مسیرهای داخلی `src/...` قرارداد عمومی محسوب نمی‌شوند؛ مصرف‌کننده باید از خروجی اصلی پکیج یا Subpathهای رسمی استفاده کند.

---

## 1) هسته تاریخ شمسی

### `JalaliConverter`

```ts
import { JalaliConverter } from 'webtanan-jalali-date-engine';

JalaliConverter.isLeapYear(1360)
JalaliConverter.daysInMonth(1403, 12)
JalaliConverter.isValid({ year: 1404, month: 12, day: 30 })
JalaliConverter.toGregorianISO({ year: 1405, month: 6, day: 11 })
JalaliConverter.toJalali({ year: 2026, month: 9, day: 2 })
```

محدوده الگوریتم:

```ts
JalaliConverter.supportedYears // { min: 1, max: 3177 }
```

تشخیص سال کبیسه برای **تمام این بازه از خود الگوریتم** انجام می‌شود و به جدول دستی یا دیتاست تعطیلات وابسته نیست.

### `JalaliYearEngine`

```ts
JalaliYearEngine.isLeap(1360)
JalaliYearEngine.esfandDays(1360)
JalaliYearEngine.daysInYear(1360)
getJalaliYearInfo(1360)
```

---

## 2) اعتبارسنجی و اعداد فارسی

```ts
DateValidator.normalize('۱۴۰۵/۶/۱۱') // 1405/06/11
DateValidator.toGregorianISO('1405/06/11') // 2026-09-02
DateValidator.compare('1405/06/10', '1405/06/11') // -1

PersianDigits.toPersian('1405')
PersianDigits.toEnglish('۱۴۰۵')
```

---

## 3) Date Picker

```ts
const picker = new WebtananDatePicker({
  rtl: true,
  persianDigits: true,
  time: true,
  minuteStep: 15,
  range: false,
  multiple: false,
  events: true,
  holidays: true,
  theme: 'industrial-light',
  minDate: '1360/01/01',
  maxDate: '1500/12/29',
});

picker.open('#host')
picker.setDate('1405/06/11')
picker.setTime(14, 30)
picker.setRange('1405/06/01', '1405/06/10')
picker.setMultipleDates(['1405/06/01', '1405/06/10'])
picker.setTheme('graphite-dark')
picker.clear()
```

رویداد DOM:

```ts
host.addEventListener('webtanan-date-change', (event) => {
  console.log(event.detail);
});
```

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
ThemeManager.applyCustomVariables(element, { accent: '#17365d' })
```

---

## 5) تعطیلات ایران

دیتاست داخلی رسمی پروژه:

```ts
IRAN_OFFICIAL_DATASET_YEARS // [1404, 1405]
getIranOfficialHolidayDataset(1405)
```

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
```

برای سال‌های بعد `HolidayDatasetLoader` دیتاست سالانه را بدون تغییر هسته بارگذاری می‌کند.

---

## 6) وضعیت روز و روز کاری

```ts
const status = new DayStatusEngine();
status.set('1405/06/11', 'meeting');
status.set({ date: '1405/06/12', status: 'closed', title: 'تعمیرات' });

const business = new BusinessDayCalculator({ holidays, dayStatuses: status });
business.isBusinessDay('1405/06/11')
business.nextBusinessDay('1405/06/11')
business.addBusinessDays('1405/06/11', 10)
```

وضعیت‌ها: `free | work | meeting | holiday | closed`

---

## 7) Event / CRM / Sales / Production / Accounting

APIهای سازمانی عمومی:

- `EventEngine`
- `CRMAdapter`
- `SalesWorkflowAdapter`
- `ProductionWorkflowAdapter`
- `AccountingCalendarAdapter`
- `WorkflowTimeline`
- `CalendarEventBridge`

رکوردهای اصلی تاریخ شمسی و معادل میلادی را نگهداری می‌کنند و در بخش‌های Audit از `createdAt` و اطلاعات کاربر پشتیبانی می‌شود.

نمونه Event:

```ts
const events = new EventEngine();
events.add({
  id: 'evt-100',
  date: '1405/06/11',
  time: '09:30',
  title: 'جلسه مشتری',
  type: 'meeting',
  user: 'کارشناس فروش',
});
```

---

# 8) تقویم بزرگ کاری — `BigWorkCalendar`

این کامپوننت برای صفحه‌های مدیریتی تمام‌عرض ساخته شده است و با Date Picker کوچک تفاوت دارد. هر خانه روز می‌تواند چند Task را نمایش دهد.

```ts
import {
  BigWorkCalendar,
  WorkTaskManager,
} from 'webtanan-jalali-date-engine';

const manager = new WorkTaskManager();
manager.add({
  date: '1405/06/11',
  title: 'پیگیری مشتری',
  time: '10:30',
  assignee: 'رضا',
  category: 'فروش',
  priority: 'high',
});

const calendar = new BigWorkCalendar(manager, {
  year: 1405,
  month: 6,
  theme: 'navy-command',
  maxVisibleTasksPerDay: 4,
});

calendar.open(document.querySelector('#calendar')!);
```

رویداد انتخاب روز:

```ts
host.addEventListener(BigWorkCalendar.dayEventName, (event) => {
  console.log(event.detail.date);
  console.log(event.detail.tasks);
});
```

قابلیت‌ها:

- ماه قبل / بعد
- نمایش چند Task در هر روز
- `+N کار دیگر`
- اولویت و وضعیت
- ساعت و مسئول
- Themeهای حرفه‌ای
- حالت readonly
- Add / Update / Remove Task

---

# 9) مدل Task

### `createWorkTask`

```ts
const task = createWorkTask({
  date: '1405/06/11',
  title: 'ارسال پیش‌فاکتور',
  time: '11:30',
  status: 'todo',
  priority: 'high',
  category: 'فروش',
  assignee: 'نگار',
  tags: ['مشتری', 'پیگیری'],
});
```

`WorkTaskRecord` شامل این فیلدها است:

- `id`
- `dateJalali`
- `dateGregorian`
- `title`
- `time / endTime`
- `status`
- `priority`
- `category`
- `assignee`
- `description`
- `color`
- `tags`
- `createdBy`
- `createdAt / updatedAt / completedAt`

وضعیت Task:

`todo | in_progress | done | cancelled`

اولویت:

`low | normal | high | urgent`

---

# 10) `WorkTaskManager`

```ts
const manager = new WorkTaskManager();
manager.add(...)
manager.update(id, patch)
manager.toggleDone(id)
manager.remove(id)
manager.getByDate('1405/06/11')
manager.getOverdue('1405/06/15')
manager.query({ assignee: 'رضا', category: 'فروش' })
manager.importRecords(records)
manager.toJSON()
```

---

# 11) Repositoryهای Task

قرارداد مشترک:

```ts
interface WorkTaskRepository {
  install?(): Promise<void>;
  upsert(task): Promise<void>;
  upsertMany(tasks): Promise<void>;
  get(id): Promise<WorkTaskRecord | null>;
  delete(id): Promise<boolean>;
  query(query?): Promise<WorkTaskRecord[]>;
  count(query?): Promise<number>;
  clear(): Promise<void>;
}
```

پیاده‌سازی‌ها:

- `MemoryWorkTaskRepository`
- `IndexedDbWorkTaskRepository`
- `SqlWorkTaskRepository`

### Browser / PWA — IndexedDB

```ts
const repo = new IndexedDbWorkTaskRepository({
  databaseName: 'company-calendar',
});
await repo.install();
```

### Electron / Node — SQLite

```ts
import Database from 'better-sqlite3';

const db = new Database('./calendar.sqlite');
const executor = new BetterSqlite3Executor(db);
const repo = new SqlWorkTaskRepository(executor, { dialect: 'sqlite' });
await repo.install();
```

### Node Server — MySQL

```ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

const executor = new Mysql2Executor(pool);
const repo = new SqlWorkTaskRepository(executor, { dialect: 'mysql' });
await repo.install();
```

> `better-sqlite3` و `mysql2` وابستگی اجباری خود کتابخانه نیستند؛ Driver از پروژه مصرف‌کننده تزریق می‌شود.

---

# 12) همگام‌سازی UI و دیتابیس — `WorkTaskPersistence`

```ts
const persistence = new WorkTaskPersistence(manager, repo);
await persistence.install();
await persistence.load();

await persistence.add({ date: '1405/06/11', title: 'پیگیری' });
await persistence.update(id, { priority: 'urgent' });
await persistence.toggleDone(id);
await persistence.remove(id);
```

در شکست عملیات Repository، Manager تا جای ممکن به وضعیت قبلی برگردانده می‌شود.

---

# 13) Backup / Restore

```ts
const backup = WorkTaskBackup.create(manager, {
  company: 'Example Company',
});

const json = WorkTaskBackup.stringify(backup);
const parsed = WorkTaskBackup.parse(json);
await WorkTaskBackup.restore(parsed, manager, repo);
```

نسخه Schema:

```ts
WORK_TASK_BACKUP_SCHEMA_VERSION // 1
```

Backup قبل از ورود به Manager مجدداً با Validation اصلی Task بررسی می‌شود.

---

# 14) PHP / Laravel — SQLite و MySQL

PHP دارای این APIهای عمومی است:

- `PdoConnectionFactory`
- `PdoWorkTaskRepository`
- `PdoCalendarStateStore`
- `JalaliDate`
- `JalaliValidator`
- `JalaliYearInfo`

SQLite:

```php
$pdo = PdoConnectionFactory::sqlite(storage_path('app/calendar.sqlite'));
$tasks = new PdoWorkTaskRepository($pdo);
$tasks->install();
```

MySQL:

```php
$pdo = PdoConnectionFactory::mysql(
    host: env('DB_HOST'),
    database: env('DB_DATABASE'),
    username: env('DB_USERNAME'),
    password: env('DB_PASSWORD'),
);

$tasks = new PdoWorkTaskRepository($pdo);
$tasks->install();
```

جزئیات: `docs/DATABASE_FA.md`

---

# 15) Storage عمومی DatePicker

Adapterهای عمومی State:

- `MemoryStorageAdapter`
- `BrowserStorageAdapter`
- `DatabaseStorageAdapter`
- `RestStorageAdapter`
- `JsonRepository`
- `DatePickerPersistence`

این لایه با Repository تخصصی Task جدا است.

---

# 16) React / Vue / Browser

React:

```ts
import { WebtananJalaliDatePickerReact } from 'webtanan-jalali-date-engine/react';
```

Vue:

```ts
import { WebtananJalaliDatePickerVue } from 'webtanan-jalali-date-engine/vue';
```

Browser Bundle:

- `dist/browser/webtanan-jalali.js`
- `dist/browser/webtanan-jalali.min.js`
- `dist/browser/webtanan-jalali.css`

Global:

```js
window.WebtananJalali
```

---

# قرارداد v1

از `v1.0.0` به بعد APIهای مستند این فایل قرارداد پایدار هستند. حذف یا تغییر ناسازگار فقط در Major Version بعدی انجام می‌شود. قابلیت‌های جدید سازگار می‌توانند در Minor Version اضافه شوند.
