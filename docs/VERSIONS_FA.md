# تاریخچه نسخه‌های Webtanan Jalali Date Engine

## v0.1.0 — پایه پروژه
- ساختار اولیه کتابخانه
- طراحی معماری
- تعریف API

## v0.2.0 — هسته چندسکویی
- آماده‌سازی JavaScript
- آماده‌سازی PHP/Laravel
- مستندات نصب

## v0.2.1 — هسته تبدیل تاریخ
- تبدیل واقعی شمسی و میلادی
- اعتبارسنجی تاریخ
- سال کبیسه و تعداد روز ماه
- تست‌های مرجع تبدیل

## v0.3.x — رابط تقویم
- رابط RTL
- اعداد فارسی
- تقویم شنبه تا جمعه
- انتخاب تک‌تاریخ
- Range و Multi Date

## v0.4.x — لایه سازمانی
- Event System
- Day Status
- Holiday Engine اولیه
- CRM Adapter
- Sales Workflow
- Production Workflow

## v0.5.0 — Date + Time و پایداری هسته
- انتخاب ساعت، دقیقه و ثانیه
- گام زمانی قابل تنظیم
- WebtananDatePicker عمومی
- CSS صنعتی و Responsive
- Laravel Facade و Service Provider
- CI خودکار Node/PHP
- ۳۲ تست JavaScript/TypeScript موفق در نقطه پایدار v0.5

## v0.6.0 — Enterprise Integration
- HolidayEngine نسخه‌پذیر با Provider
- Provider تعطیلات ثابت شمسی ایران
- امکان تزریق تعطیلات قمری/متحرک به‌صورت دیتاست سالانه
- جلوگیری از تعطیلی تکراری و تاریخ نامعتبر
- MemoryStorageAdapter و BrowserStorageAdapter
- JsonRepository با schema version
- export/import کامل state تقویم
- DatePickerPersistence برای save/restore
- Laravel config قابل انتشار
- Laravel Blade view قابل انتشار
- ۴۰ تست JavaScript/TypeScript در نقطه پایدار v0.6

## v0.7.0 — Integration & Validation
- JalaliValidator برای PHP با پشتیبانی اعداد فارسی و عربی
- JalaliDateRule برای Validation لاراول
- اعتبارسنجی واقعی روزهای ماه میلادی در TypeScript و PHP
- DatabaseStorageAdapter با Driver تزریقی
- RestStorageAdapter با GET/PUT/DELETE و Fetch قابل تزریق
- Web Component مستقل `webtanan-jalali-date-picker`
- import امن Web Component در Node و محیط‌های بدون DOM
- Performance/Stress Test برای هزاران تبدیل رفت‌وبرگشت
- ۱۵ Test Suite و ۴۷ تست موفق

## v0.8.0 — Accessibility, Backend Stores & Official Calendar Core
- KeyboardDateNavigator برای Arrow / PageUp / PageDown / Home / End
- اتصال Keyboard Navigation به DatePicker و پشتیبانی Escape
- ARIA roles و وضعیت‌های `aria-selected`، `aria-disabled` و `aria-current`
- PdoCalendarStateStore برای SQLite/MySQL/PostgreSQL از طریق PDO
- LaravelCacheStateStore برای ذخیره State در Cache لاراول
- AnnualHolidayDataset با metadata منبع، سال و تاریخ تأیید
- اصلاح هسته تبدیل TypeScript و PHP با الگوریتم مبتنی بر نقاط شکست تقویم رسمی جلالی
- اصلاح مرز کبیسه ۱۴۰۳/۱۴۰۴ و جلوگیری از پذیرش ۱۴۰۴/۱۲/۳۰
- Regression Test برای ۱۳۹۹، ۱۴۰۳، ۱۴۰۴ و ۱۴۰۵
- ۱۷ Test Suite و ۵۸ تست موفق در checkpoint پایدار v0.8

## v0.9.0 — Selection & Policy Layer
- Range واقعی با تعامل کاربر
- Multiple Selection داخل DatePicker
- Disabled Dates
- جلوگیری از انتخاب روز `closed`
- اتصال HolidayEngine و DayStatusEngine به UI
- نمایش وضعیت‌های تعطیل، جلسه، کار و بسته در تقویم
- توسعه Web Component برای range / multiple / disabled-dates
- حفظ سازگاری Persistence بین single date، range و multiple
- ۱۸ Test Suite و ۶۵ تست موفق در checkpoint پایدار v0.9

## v0.10.0 — Professional Themes & Official Holiday Datasets
- ThemeManager مستقل
- چهار تم حرفه‌ای: Industrial Light، Navy Command، Steel Neutral و Graphite Dark
- تم قابل استفاده از طریق Web Component
- CSS مبتنی بر Variables برای توسعه تم‌های آینده
- دیتاست کامل تعطیلات رسمی سال ۱۴۰۴
- دیتاست کامل تعطیلات رسمی سال ۱۴۰۵
- هر سال با ۲۶ روز تعطیل رسمی مناسبتی
- metadata منبع، URL و تاریخ بازبینی برای هر Dataset
- source مستقل `annual-dataset`
- fallback به تعطیلات ثابت برای سال‌های فاقد دیتاست داخلی

## v0.11.0 — General Leap-Year Engine & Browser Build
- `JalaliYearEngine` و `getJalaliYearInfo`
- تشخیص کبیسه الگوریتمی برای تمام سال‌های ۱ تا ۳۱۷۷، از جمله سال‌های قدیمی مانند ۱۳۶۰
- تست سراسری تعداد روز اسفند و سال برای کل محدوده پشتیبانی‌شده
- Theme سفارشی با CSS Variables
- HolidayDatasetLoader برای دیتاست‌های سالانه آینده
- حذف هسته‌های قدیمی ناسازگار
- Browser Bundle و نسخه Minified با esbuild
- Demo آزمایشگاهی Theme / Leap Year / Holidays
- ۲۲ Test Suite و ۸۸ تست موفق در checkpoint پایدار v0.11

## v0.12.0 — React & Vue Adapters
- Codec مشترک برای Single / Range / Multiple / DateTime
- React Component رسمی از مسیر `webtanan-jalali-date-engine/react`
- Vue 3 Component رسمی از مسیر `webtanan-jalali-date-engine/vue`
- React و Vue به‌صورت Peer Dependency اختیاری؛ بدون سنگین‌کردن هسته اصلی
- مستند نصب و استفاده واقعی فریم‌ورک‌ها
- ۲۳ Test Suite و ۹۴ تست موفق در checkpoint پایدار v0.12

## v0.13.0 — Audit & Enterprise Records
- EventEngine با شناسه یکتا، اعتبارسنجی تاریخ/زمان، معادل میلادی و `createdAt`
- CRM Record کامل با API سازگار با Timeline قدیمی
- DateValidator رشته‌ای با پشتیبانی اعداد فارسی/عربی
- Sales Workflow با تاریخ میلادی، Audit metadata، مرحله جاری و تأخیر
- Production Workflow با تاریخ‌های معتبر، معادل میلادی، مسئول مرحله و گزارش مدیریتی
- حذف `any` از CalendarEventBridge و تبدیل آن به Generic Type-safe API
- انتشار Typeهای سازمانی در API عمومی

## v0.14.0 / v0.14.1 — Business Day, Accounting & Day Status
- BusinessDayCalculator با جمعه، تعطیلات رسمی/شرکتی و روزهای بسته
- محاسبه روز کاری بعد/قبل، افزودن N روز کاری و شمارش بازه
- AccountingCalendarAdapter برای فاکتور، سررسید، دریافت، حقوق، مالیات و بستن دوره
- گزارش سررسیدهای باز و جمع مبالغ
- ارتقای DayStatusEngine با تاریخ معتبر، Bulk API، metadata، فیلتر و خروجی JSON
- اتصال مستقیم این لایه‌ها به تعطیلات رسمی ۱۴۰۴ و ۱۴۰۵

## v0.15.0 — API Documentation & Real Demos
- مستند کامل فارسی `docs/API_FA.md`
- Demo واقعی CRM با Theme سرمه‌ای
- Demo واقعی فروش با Theme صنعتی روشن
- Demo واقعی حسابداری با Theme فولادی و Business Day
- Demo واقعی تولید با Theme گرافیتی تیره
- تمام Demoها از Browser Bundle واقعی `dist/browser` استفاده می‌کنند

## مسیر تا v1.0.0
- Release hardening و بررسی API عمومی
- تست Smoke برای بسته npm و Subpathهای React/Vue/CSS
- بهبود Demo index و راهنمای اجرای Demoها
- تکمیل README با همه قابلیت‌های جدید
- بررسی Migration و قرارداد SemVer
- ساخت Release candidate و سپس v1.0.0
