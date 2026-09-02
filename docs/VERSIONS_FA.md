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
- رد تاریخ‌هایی مانند 2026-02-31
- DatabaseStorageAdapter با Driver تزریقی
- RestStorageAdapter با GET/PUT/DELETE و Fetch قابل تزریق
- Web Component مستقل `webtanan-jalali-date-picker`
- import امن Web Component در Node و محیط‌های بدون DOM
- Performance/Stress Test برای هزاران تبدیل رفت‌وبرگشت

## برنامه مسیر بعد
### v0.8.x
- دیتاست سالانه تعطیلات متحرک با منبع مشخص
- Adapterهای نمونه SQL و Laravel Cache
- Accessibility و Keyboard Navigation کامل
- Demoهای اجرایی Web Component و Laravel

### v1.0.0
- API پایدار
- مستندات کامل
- Demoهای CRM، فروش، حسابداری و تولید
- Release و بسته‌های انتشار رسمی
