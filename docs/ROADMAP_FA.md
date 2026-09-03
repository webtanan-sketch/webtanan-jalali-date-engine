# نقشه راه نهایی Webtanan Jalali Date Engine

وضعیت مبنا: **v0.17.0**

هدف: رسیدن به **v1.0.0 پایدار سازمانی** با تقویم شمسی حرفه‌ای، تقویم کاری بزرگ، Task/Event management، ذخیره‌سازی محلی و اتصال امن به MySQL.

---

## v0.18.0 — Big Work Calendar / تقویم بزرگ کاری

یک حالت مستقل و تمام‌صفحه برای استفاده مدیریتی اضافه می‌شود.

### نمای اصلی
- تقویم ماهانه بزرگ و Responsive
- هر روز یک خانه بزرگ با فضای کافی برای لیست کارها
- نمایش تاریخ شمسی و در صورت نیاز معادل میلادی
- نمایش تعطیلات رسمی، تعطیلات شرکت و وضعیت روز
- نمایش تعداد کارهای باقی‌مانده و انجام‌شده

### لیست کار هر روز
هر روز بتواند چندین Task داشته باشد با فیلدهای:
- عنوان
- ساعت شروع و پایان
- وضعیت: انجام‌نشده / درحال انجام / انجام‌شده / لغوشده
- اولویت: عادی / مهم / فوری
- دسته‌بندی
- مسئول / کاربر
- توضیح
- رنگ یا Tag
- تاریخ ایجاد و آخرین ویرایش
- تاریخ شمسی و معادل میلادی

### تعامل
- افزودن سریع کار از داخل همان روز
- ویرایش و حذف کار
- علامت انجام‌شدن بدون بازکردن فرم کامل
- بازکردن پنل جزئیات روز
- فیلتر بر اساس وضعیت، مسئول، دسته‌بندی و اولویت
- نمایش «+N کار دیگر» در روزهای شلوغ
- جابه‌جایی بین ماه قبل/بعد و رفتن به امروز
- پشتیبانی Keyboard و ARIA

### API
- `BigCalendar`
- `TaskEngine`
- `getTasksByDate()`
- `addTask()`
- `updateTask()`
- `completeTask()`
- `deleteTask()`
- `moveTask()`
- `filterTasks()`

---

## v0.19.0 — Local Database / دیتابیس محلی واقعی

### SQLite
برای Electron، Node و نرم‌افزارهای دسکتاپ:
- SQLite به‌عنوان دیتابیس محلی استاندارد
- Migration و Schema versioning
- Transaction
- Index برای تاریخ، وضعیت، مسئول و نوع رکورد
- Backup / Restore
- Export / Import JSON

### Browser
برای HTML/Browser:
- IndexedDB Adapter به‌عنوان ذخیره‌سازی محلی ساختاریافته
- fallback به LocalStorage فقط برای Stateهای سبک

### جداول اصلی
- `calendar_tasks`
- `calendar_events`
- `day_statuses`
- `holidays`
- `calendar_settings`
- `audit_log`

---

## v0.20.0 — MySQL & Server Persistence

### MySQL
- MySQL Repository/Driver
- Migration مستقل MySQL
- CRUD کامل Task/Event/Status/Holiday
- Query بر اساس بازه تاریخ
- Pagination برای داده زیاد
- Transaction
- Connection health check

### Laravel / PHP
- استفاده از PDO / Laravel Database
- Config اتصال
- Repository آماده
- Validation
- Migration لاراول

### JavaScript / Browser
اتصال مستقیم Browser به MySQL مجاز نیست؛ برای امنیت:
- REST Adapter / Backend API
- Token/Auth توسط اپلیکیشن میزبان

### Electron / Node
- امکان Driver مستقیم Server-side در صورت انتخاب برنامه میزبان

---

## v0.21.0 — Data Sync & Enterprise Reliability

- انتخاب Storage mode: Memory / Browser / SQLite / REST / MySQL backend
- لایه Repository واحد برای تمام Storageها
- Conflict-safe update
- optimistic concurrency / revision
- Audit Log
- createdBy / updatedBy
- createdAt / updatedAt
- migration test
- backup/restore test
- تست دیتابیس با حجم بالا

---

## v1.0.0-rc.1 — Release Candidate

- Freeze کردن Public API
- بررسی کامل TypeScript declarations
- بررسی React/Vue/Web Component
- تست Big Calendar روی Desktop/Mobile
- تست Accessibility
- تست Performance با هزاران Task/Event
- تست SQLite
- تست MySQL integration
- تست Laravel/PHP
- تست ESM / CommonJS / Browser Bundle
- Package Smoke Test
- مستندات فارسی کامل
- راهنمای Migration و Database
- Demo واقعی Big Work Calendar
- Demo CRM / Sales / Accounting / Production

هیچ قابلیت جدیدی بعد از RC اضافه نمی‌شود؛ فقط Bug Fix و Hardening.

---

## v1.0.0 — نسخه نهایی پایدار

شرط انتشار:
- CI کاملاً سبز
- صفر خطای شناخته‌شده بحرانی
- Public API پایدار
- تست دیتابیس محلی و MySQL موفق
- Demoها قابل اجرا
- مستندات نصب و API کامل
- بسته انتشار ESM / CommonJS / Browser / CSS / React / Vue / PHP-Laravel آماده

---

# تصمیم معماری دیتابیس

## Local
**SQLite** دیتابیس محلی اصلی برای Desktop/Electron خواهد بود.

## Browser
**IndexedDB** برای ذخیره‌سازی ساختاریافته محلی Browser استفاده می‌شود.

## Server
**MySQL** از طریق Backend/Laravel/Node server یا Driver امن استفاده می‌شود.

اطلاعات اتصال و رمز MySQL هرگز داخل JavaScript سمت Browser قرار نمی‌گیرد.
