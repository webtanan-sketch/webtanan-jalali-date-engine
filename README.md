# Webtanan Jalali Date Engine

## موتور تاریخ شمسی حرفه‌ای برای نرم‌افزارهای ایرانی

**Webtanan Jalali Date Engine** یک موتور چندسکویی تاریخ و زمان جلالی برای نرم‌افزارهای **CRM، فروش، حسابداری، سفارش، تولید، برنامه‌ریزی، گزارش‌گیری و سامانه‌های مدیریتی** است.

این پروژه فقط یک Date Picker نیست؛ هسته تبدیل تاریخ، سال کبیسه، تعطیلات، روز کاری، رویداد، Workflow، Persistence، Theme و Adapterهای JavaScript / TypeScript / React / Vue / Electron / PHP / Laravel را در یک معماری قابل توسعه ارائه می‌کند.

> وضعیت توسعه: **v0.15.0 — Release Hardening پیش از v1.0**

---

## قابلیت‌های اصلی

### هسته جلالی

- تبدیل واقعی شمسی ↔ میلادی
- خروجی Gregorian ISO
- اعتبارسنجی تاریخ شمسی و میلادی
- پشتیبانی اعداد فارسی، عربی و لاتین
- الگوریتم سال کبیسه مستقل از دیتاست تعطیلات
- محدوده پشتیبانی فعلی: سال شمسی **۱ تا ۳۱۷۷**
- محاسبه تعداد روز ماه و سال
- اطلاعات کامل سال با `JalaliYearEngine`

نمونه:

```ts
JalaliConverter.isLeapYear(1360); // false
JalaliConverter.isLeapYear(1358); // true
getJalaliYearInfo(1360);
```

یعنی انتخاب سال قدیمی مثل **۱۳۶۰** نیز از خود الگوریتم محاسبه می‌شود و به لیست دستی سال‌ها وابسته نیست.

### Date Picker

- Single Date
- Range
- Multiple Date
- Date + Time
- ساعت، دقیقه و ثانیه
- گام زمانی قابل تنظیم، مثلاً ۱۵ دقیقه
- Min / Max Date
- Disabled Dates
- روزهای بسته سازمانی
- Keyboard Navigation
- ARIA Accessibility
- اعداد فارسی
- RTL کامل
- Web Component مستقل

### Theme System

چهار Theme حرفه‌ای داخلی:

- **Industrial Light — صنعتی روشن**
- **Navy Command — فرماندهی سرمه‌ای**
- **Steel Neutral — فولادی خنثی**
- **Graphite Dark — گرافیتی تیره**

همچنین Theme سفارشی با CSS Variables قابل تعریف است.

### تعطیلات ایران

دیتاست رسمی داخلی فعلی:

- سال **۱۴۰۴**
- سال **۱۴۰۵**

هر Dataset دارای metadata منبع و تاریخ بازبینی است. برای سال‌های بعد `HolidayDatasetLoader` وجود دارد تا دیتاست سالانه بدون تغییر هسته اضافه شود.

تعطیلات شرکت و تعطیلی‌های سفارشی نیز مستقل قابل ثبت هستند.

### Day Status و روز کاری

وضعیت‌های روز:

- `free` — آزاد
- `work` — دارای کار
- `meeting` — جلسه
- `holiday` — تعطیل
- `closed` — بسته

`BusinessDayCalculator` می‌تواند:

- روز کاری بعدی/قبلی را پیدا کند
- N روز کاری اضافه یا کم کند
- تعداد روزهای کاری یک بازه را حساب کند
- جمعه، تعطیلات رسمی/شرکتی و روزهای بسته را لحاظ کند

### Event & Audit

رکوردهای سازمانی شامل:

- تاریخ شمسی
- معادل میلادی
- زمان
- کاربر ثبت‌کننده
- `createdAt`
- توضیحات

### CRM

- ثبت Follow-up
- Timeline مشتری
- رکورد Audit کامل
- پیگیری‌های آینده

### گردش فروش

```text
ثبت سفارش → تأیید → تولید → بارگیری → تحویل
```

- وضعیت هر مرحله
- تاریخ شمسی و میلادی
- مسئول
- درصد پیشرفت
- مرحله جاری
- تشخیص تأخیر

### گردش تولید

- برنامه‌ریزی
- تأمین مواد
- تولید
- کنترل کیفیت
- بسته‌بندی
- بارگیری
- تحویل

به همراه مسئول مرحله، تاریخ، Audit metadata، درصد پیشرفت و کنترل موعد.

### تقویم حسابداری

`AccountingCalendarAdapter` برای:

- فاکتور
- سررسید پرداخت
- دریافت
- حقوق
- مالیات
- بستن دوره

به همراه گزارش سررسیدهای باز و جمع مبالغ.

### Persistence و Backend

- MemoryStorageAdapter
- BrowserStorageAdapter
- DatabaseStorageAdapter
- RestStorageAdapter
- JsonRepository
- DatePickerPersistence
- PDO Store در PHP
- Laravel Cache Store

---

# نصب

## JavaScript / TypeScript از GitHub

تا قبل از انتشار رسمی npm:

```bash
npm install github:webtanan-sketch/webtanan-jalali-date-engine
```

بعد از انتشار رسمی npm:

```bash
npm install webtanan-jalali-date-engine
```

## PHP / Laravel از GitHub

```bash
composer config repositories.webtanan-jalali vcs https://github.com/webtanan-sketch/webtanan-jalali-date-engine.git
composer require webtanan/jalali-date-engine:dev-main
```

نصب ساده `composer require webtanan/jalali-date-engine` فقط بعد از انتشار رسمی Packagist قابل اتکا خواهد بود.

---

# استفاده پایه

```ts
import {
  JalaliConverter,
  JalaliYearEngine,
  WebtananDatePicker,
  HolidayEngine,
  BusinessDayCalculator,
} from 'webtanan-jalali-date-engine';

JalaliConverter.toGregorianISO({ year: 1405, month: 6, day: 11 });
// 2026-09-02

JalaliYearEngine.isLeap(1360);
// false
```

Date Picker:

```ts
const picker = new WebtananDatePicker({
  rtl: true,
  persianDigits: true,
  time: true,
  minuteStep: 15,
  theme: 'navy-command',
});

picker.setDate('1405/06/11');
picker.setTime(14, 30);
picker.open('#calendar');
```

---

# React

```tsx
import { WebtananJalaliDatePickerReact } from 'webtanan-jalali-date-engine/react';
import 'webtanan-jalali-date-engine/css';

<WebtananJalaliDatePickerReact
  value="1405/06/11"
  options={{ theme: 'industrial-light', time: true }}
  onChange={(value) => console.log(value)}
/>
```

React یک Peer Dependency اختیاری است و هسته اصلی بدون React کار می‌کند.

# Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { WebtananJalaliDatePickerVue } from 'webtanan-jalali-date-engine/vue';
import 'webtanan-jalali-date-engine/css';

const value = ref('1405/06/11');
</script>

<template>
  <WebtananJalaliDatePickerVue v-model="value" />
</template>
```

Vue نیز Peer Dependency اختیاری است.

---

# Browser / HTML

```bash
npm install
npm run build
```

خروجی‌ها:

```text
dist/browser/webtanan-jalali.js
dist/browser/webtanan-jalali.min.js
dist/browser/webtanan-jalali.css
```

Global مرورگر:

```js
window.WebtananJalali
```

Web Component نیز در Browser Bundle به‌صورت خودکار ثبت می‌شود:

```html
<webtanan-jalali-date-picker
  value="1405/06/11"
  theme="graphite-dark"
></webtanan-jalali-date-picker>
```

---

# Laravel

هسته PHP شامل:

- JalaliDate
- JalaliValidator
- Laravel Validation Rule
- Facade
- Service Provider
- Blade View
- Laravel Cache Store
- PDO Store

نمونه:

```php
use Webtanan\JalaliDateEngine\JalaliDate;

JalaliDate::toGregorianIso(1405, 6, 11);
// 2026-09-02

JalaliDate::isLeapYear(1360);
// false
```

---

# Demoهای واقعی

بعد از `npm run build` فایل‌های زیر را از طریق یک HTTP server محلی باز کنید:

```text
demo/index.html        Theme / Leap Year / Holidays Lab
demo/crm.html          CRM Follow-up
demo/sales.html        Sales Workflow
demo/accounting.html   Accounting + Business Day
demo/production.html   Production Workflow
```

---

# تست و کنترل کیفیت

```bash
npm run test:ci
```

این دستور شامل:

1. TypeScript Typecheck
2. Jest Test Suite
3. TypeScript Build
4. Browser + Minified Build
5. Package Smoke Test

PHP:

```bash
php php/tests/run.php
```

CI روی هر Push به `main` اجرا می‌شود.

---

# مستندات

- `docs/API_FA.md` — API کامل فارسی
- `docs/INSTALLATION_FA.md` — نصب
- `docs/LARAVEL_FA.md` — Laravel
- `docs/FRAMEWORKS_FA.md` — React / Vue / Electron
- `docs/HOLIDAYS_FA.md` — سیاست دیتاست تعطیلات
- `docs/THEMES_FA.md` — Theme System
- `docs/VERSIONS_FA.md` — تاریخچه نسخه‌ها

---

# ساختار اصلی پروژه

```text
src/
├── core/
├── calendar/
├── accessibility/
├── enterprise/
├── enterprise/holidays/
├── framework/
├── integrations/
├── storage/
├── theme/
├── time/
├── ui/
└── web-component/

php/
tests/
demo/
docs/
scripts/
```

---

# مسیر انتشار

پروژه اکنون در مرحله **Release Hardening پیش از v1.0.0** است. قبل از v1.0 قرارداد API، Package Exports، Demoها، Smoke Test و مستندات نهایی تثبیت می‌شوند.

انتشار در npm یا Packagist فقط زمانی در مستندات به‌عنوان نصب مستقیم اعلام می‌شود که انتشار واقعی انجام شده باشد.

---

## مجوز

MIT

**Webtanan — ابزارهای حرفه‌ای برای نرم‌افزارهای فارسی و سازمانی**
