# نقشه راه Webtanan Jalali Date Engine

## وضعیت فعلی

**v1.0.0 — Stable / پایدار**

مسیر اولیه تا نسخه 1 تکمیل شده است.

---

## موارد تکمیل‌شده تا v1

### هسته تقویم
- تبدیل دوطرفه شمسی ↔ میلادی
- اعتبارسنجی شمسی و میلادی
- تشخیص کبیسه الگوریتمی برای سال‌های 1 تا 3177
- اعداد فارسی/عربی/انگلیسی
- Date + Time
- Single / Range / Multiple
- Min / Max / Disabled Dates

### رابط کاربری
- DatePicker حرفه‌ای RTL
- Keyboard Navigation و ARIA
- Web Component
- چهار Theme صنعتی
- Theme سفارشی با CSS Variables
- BigWorkCalendar تمام‌عرض
- چند Task در هر خانه روز

### تعطیلات و سازمان
- تعطیلات رسمی 1404
- تعطیلات رسمی 1405
- Dataset Loader سالانه
- تعطیلات شرکت
- Day Status
- Business Day Calculator
- Event / CRM / Sales / Production / Accounting

### Task و دیتابیس
- WorkTaskManager
- Memory Repository
- IndexedDB برای Browser/PWA
- SQLite برای Node/Electron
- MySQL برای Node Server
- SQLite/MySQL با PDO در PHP/Laravel
- WorkTaskPersistence
- Backup / Restore نسخه‌دار
- Stress Test با 5000 Task

### بسته‌بندی
- TypeScript declarations
- CommonJS
- ESM
- Browser Bundle
- Minified Bundle
- CSS export
- React adapter
- Vue adapter
- PHP / Laravel package structure

### کنترل کیفیت
- Public API Contract
- Package Smoke Test
- CI Node/PHP
- Release Candidate کامل
- 35 Test Suite و 180 تست موفق در RC

---

# مسیر بعد از v1

نسخه‌های `1.x` فقط قابلیت‌های سازگار با API پایدار اضافه خواهند کرد. ایده‌های آینده:

- Week View / نمای هفتگی کاری
- Day Timeline / برنامه ساعتی روز
- Drag & Drop اختیاری برای Taskها
- Recurring Tasks / کارهای تکرارشونده
- Sync Provider برای Offline-first
- Laravel Migration و Eloquent Adapter اختیاری
- MySQL/PostgreSQL integration tests در محیط‌های سرویس‌دار CI
- Localization فراتر از فارسی در صورت نیاز

تغییر ناسازگار Public API فقط در Major Version بعدی انجام خواهد شد.
