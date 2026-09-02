# Webtanan Jalali Date Engine

## موتور حرفه‌ای تاریخ شمسی برای نرم‌افزارهای ایرانی

**Webtanan Jalali Date Engine** یک کتابخانه چندسکویی برای مدیریت تاریخ جلالی، انتخاب تاریخ، بازه زمانی، رویداد، تعطیلات و گردش‌های کاری سازمانی است.

این پروژه فقط یک Date Picker ساده نیست؛ هدف آن فراهم‌کردن یک هسته قابل استفاده در نرم‌افزارهای **CRM، فروش، حسابداری، سفارش، تولید، برنامه‌ریزی، گزارش‌گیری و سامانه‌های مدیریتی** است.

> وضعیت فعلی پروژه: **v0.5.0 — نسخه توسعه سازمانی**

---

## ویژگی‌های اصلی

### هسته تاریخ شمسی

- تبدیل واقعی شمسی به میلادی
- تبدیل واقعی میلادی به شمسی
- اعتبارسنجی تاریخ
- تشخیص سال کبیسه
- محاسبه تعداد روزهای ماه
- خروجی استاندارد ISO
- پشتیبانی از اعداد فارسی و انگلیسی

نمونه مرجع:

```text
1405/01/01  →  2026-03-21
2026-09-02  →  1405/06/11
```

### انتخاب تاریخ

- انتخاب تک تاریخ
- انتخاب بازه تاریخ
- انتخاب چند تاریخ
- حداقل و حداکثر تاریخ مجاز
- روزهای غیرفعال
- جابه‌جایی ماه قبل و بعد
- نمایش ماه و سال شمسی

### رویدادها و تقویم سازمانی

هر روز می‌تواند شامل اطلاعات کاری باشد:

- تماس مشتری
- جلسه
- پرداخت
- پیگیری فروش
- تحویل سفارش
- برنامه تولید
- تعطیلات رسمی
- تعطیلات اختصاصی شرکت

### وضعیت روزها

پشتیبانی از وضعیت‌های کاری:

- آزاد
- دارای کار
- جلسه
- تعطیل
- بسته

### گردش فروش

مدل آماده برای مسیرهایی مانند:

```text
ثبت سفارش
   ↓
تأیید
   ↓
تولید
   ↓
بارگیری
   ↓
تحویل
```

### گردش تولید

پشتیبانی از مراحل:

- برنامه‌ریزی
- تأمین مواد
- تولید
- کنترل کیفیت
- بسته‌بندی
- بارگیری
- تحویل

به همراه:

- مسئول مرحله
- تاریخ مرحله
- توضیح
- وضعیت
- درصد پیشرفت
- تشخیص تأخیر

---

# نصب

## نصب مستقیم از GitHub برای JavaScript / TypeScript

تا قبل از انتشار رسمی در npm می‌توانید مستقیماً از GitHub نصب کنید:

```bash
npm install github:webtanan-sketch/webtanan-jalali-date-engine
```

پس از انتشار در npm:

```bash
npm install webtanan-jalali-date-engine
```

### استفاده

```ts
import {
  JalaliConverter,
  WebtananDatePicker,
  EventEngine,
  SalesWorkflowAdapter,
  ProductionWorkflowAdapter
} from 'webtanan-jalali-date-engine';
```

نمونه تبدیل تاریخ:

```ts
JalaliConverter.toGregorianISO({
  year: 1405,
  month: 1,
  day: 1
});

// 2026-03-21
```

---

# نصب در Laravel

## نصب مستقیم از GitHub با Composer

در پروژه Laravel اجرا کنید:

```bash
composer config repositories.webtanan-jalali vcs https://github.com/webtanan-sketch/webtanan-jalali-date-engine.git
composer require webtanan/jalali-date-engine:dev-main
```

پس از انتشار در Packagist فقط دستور زیر کافی خواهد بود:

```bash
composer require webtanan/jalali-date-engine
```

پکیج دارای Laravel Auto Discovery است و Service Provider به‌صورت خودکار شناسایی می‌شود.

نمونه استفاده:

```php
use Webtanan\JalaliDateEngine\JalaliDate;

JalaliDate::toGregorianIso(1405, 1, 1);
// 2026-03-21

JalaliDate::toJalali(2026, 9, 2);
// ['year' => 1405, 'month' => 6, 'day' => 11]
```

Facade لاراول نیز تعریف شده است:

```php
JalaliDate::format(1405, 6, 11);
```

---

# React

کتابخانه وابستگی اجباری به React ندارد و می‌تواند داخل هر کامپوننت React استفاده شود.

```tsx
import { useEffect, useRef } from 'react';
import { WebtananDatePicker } from 'webtanan-jalali-date-engine';
import 'webtanan-jalali-date-engine/src/ui/webtanan-jalali.css';

export function DateField() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const picker = new WebtananDatePicker();
    if (host.current) picker.open(host.current);
    return () => picker.close();
  }, []);

  return <div ref={host} />;
}
```

---

# Vue

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { WebtananDatePicker } from 'webtanan-jalali-date-engine';
import 'webtanan-jalali-date-engine/src/ui/webtanan-jalali.css';

const host = ref<HTMLElement | null>(null);
let picker: WebtananDatePicker | null = null;

onMounted(() => {
  picker = new WebtananDatePicker();
  if (host.value) picker.open(host.value);
});

onBeforeUnmount(() => picker?.close());
</script>

<template>
  <div ref="host"></div>
</template>
```

---

# HTML / JavaScript

پس از Build می‌توان فایل خروجی را در پروژه‌های HTML یا پنل‌های مدیریتی استفاده کرد.

```bash
npm install
npm run build
```

خروجی TypeScript در پوشه زیر ساخته می‌شود:

```text
dist/
```

---

# Electron و نرم‌افزارهای دسکتاپ

هسته پروژه وابستگی اجباری به مرورگر ندارد. بخش‌های تبدیل تاریخ، رویداد، گردش فروش و تولید می‌توانند مستقیماً در Electron یا سایر محیط‌های JavaScript استفاده شوند.

رابط گرافیکی Date Picker در Renderer Process قابل استفاده است.

---

# API اصلی

## Date Picker

```ts
const picker = new WebtananDatePicker({
  rtl: true,
  persianDigits: true,
  time: false,
  range: true,
  events: true,
  holidays: true,
  minuteStep: 15
});

picker.open();
picker.close();
picker.setDate('1405/06/11');
picker.getDate();
picker.setRange('1405/06/01', '1405/06/20');
picker.getRange();
picker.addEvent({
  date: '1405/06/11',
  title: 'جلسه فروش'
});
picker.clear();
```

## تبدیل تاریخ

```ts
JalaliConverter.toGregorian({ year: 1405, month: 6, day: 11 });
JalaliConverter.toGregorianISO({ year: 1405, month: 6, day: 11 });
JalaliConverter.toJalali({ year: 2026, month: 9, day: 2 });
JalaliConverter.isLeapYear(1404);
JalaliConverter.daysInMonth(1405, 12);
```

---

# ساختار پروژه

```text
webtanan-jalali-date-engine/
├── src/
│   ├── core/
│   ├── calendar/
│   ├── enterprise/
│   ├── integrations/
│   ├── ui/
│   └── utils/
├── php/
│   ├── src/
│   │   └── Laravel/
│   └── tests/
├── tests/
├── demo/
├── docs/
├── composer.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── .github/workflows/ci.yml
```

---

# تست و کنترل کیفیت

تست‌ها در هر Push به شاخه `main` توسط GitHub Actions اجرا می‌شوند.

### JavaScript / TypeScript

```bash
npm install
npm run typecheck
npm test
npm run build
```

یا همه مراحل:

```bash
npm run test:ci
```

### PHP

```bash
php php/tests/run.php
```

CI شامل موارد زیر است:

- TypeScript typecheck
- Jest tests
- Build
- Composer validation
- PHP syntax validation
- PHP conversion tests

---

# نسخه‌ها

## v0.1.0 — پایه معماری

- ساخت ریپازیتوری
- معماری اولیه
- تعریف API و ساختار داده

## v0.2.0 — هسته تاریخ

- هسته TypeScript
- هسته PHP
- ساختار تبدیل تاریخ
- ابزار اعداد فارسی

## v0.3.0 — تقویم تعاملی

- Calendar Renderer
- انتخاب تاریخ
- بازه تاریخ
- چند تاریخ
- رابط RTL

## v0.4.0 — لایه سازمانی

- رویدادها
- وضعیت روزها
- تعطیلات
- CRM Adapter
- Sales Workflow
- Production Workflow

## v0.5.0 — نسخه توسعه سازمانی

- تبدیل واقعی شمسی ↔ میلادی
- خروجی ISO
- رابط WebtananDatePicker
- حذف کامل نام قدیمی GFT از API جدید
- Composer / Laravel Auto Discovery
- Facade و Service Provider
- npm build و Jest
- GitHub Actions CI
- تست TypeScript و PHP
- مستندات نصب Laravel، React، Vue و Electron

## مسیر بعدی

نسخه‌های بعدی روی موارد زیر تمرکز خواهند داشت:

- Time Picker کامل
- تعطیلات رسمی ایران به‌صورت دیتاست نسخه‌بندی‌شده
- Blade Component لاراول
- Web Component مستقل
- قالب‌های آماده CRM / فروش / حسابداری / تولید
- گزارش‌گیری و Persistence Adapter
- Accessibility کامل
- Performance Benchmark

---

# مجوز

مجوز فعلی پروژه: **MIT**

---

**توسعه داده شده توسط Webtanan**

کتابخانه‌های حرفه‌ای برای نرم‌افزارهای فارسی و سازمانی.
