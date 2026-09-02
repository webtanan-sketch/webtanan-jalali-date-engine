# راهنمای نصب Webtanan Jalali Date Engine

این پروژه در نسخه `0.5.0` مستقیماً از GitHub نیز قابل نصب است. پس از انتشار رسمی در npm و Packagist، دستورات کوتاه رجیستری نیز قابل استفاده خواهند بود.

---

## Laravel / PHP با Composer و GitHub

در ریشه پروژه Laravel یا PHP اجرا کنید:

```bash
composer config repositories.webtanan-jalali vcs https://github.com/webtanan-sketch/webtanan-jalali-date-engine.git
composer require webtanan/jalali-date-engine:dev-main
```

در Laravel، Service Provider و Facade از طریق Auto Discovery معرفی شده‌اند.

نمونه:

```php
use Webtanan\JalaliDateEngine\JalaliDate;

$date = JalaliDate::toGregorianIso(1405, 1, 1);
// 2026-03-21
```

پس از انتشار رسمی در Packagist:

```bash
composer require webtanan/jalali-date-engine
```

قابل استفاده در:

- Laravel
- Symfony
- PHP خام
- سایر فریم‌ورک‌های PHP با Composer و PSR-4

---

## JavaScript / TypeScript مستقیم از GitHub

```bash
npm install github:webtanan-sketch/webtanan-jalali-date-engine
```

پکیج در زمان نصب Git با اسکریپت `prepare` ساخته می‌شود.

نمونه:

```ts
import { JalaliConverter, WebtananDatePicker } from 'webtanan-jalali-date-engine';

JalaliConverter.toGregorianISO({ year: 1405, month: 1, day: 1 });
```

پس از انتشار رسمی در npm:

```bash
npm install webtanan-jalali-date-engine
```

قابل استفاده در:

- JavaScript
- TypeScript
- React
- Vue
- Angular
- Vite
- Electron
- HTML / WebView

---

## Clone برای توسعه

```bash
git clone https://github.com/webtanan-sketch/webtanan-jalali-date-engine.git
cd webtanan-jalali-date-engine
npm install
npm run test:ci
```

---

## استفاده از CSS صنعتی RTL

فایل رابط کاربری:

```text
src/ui/webtanan-jalali.css
```

در پروژه‌های Frontend آن را به استایل‌های برنامه اضافه کنید.

---

## تست PHP

```bash
php php/tests/run.php
```

## تست JavaScript / TypeScript

```bash
npm run test:ci
```

این دستور TypeScript typecheck، Jest tests و Build را اجرا می‌کند.

---

## قابلیت‌های قابل استفاده

- تبدیل شمسی ↔ میلادی
- تقویم جلالی
- انتخاب تک تاریخ
- بازه زمانی
- چند تاریخ
- زمان با گام دقیقه/ثانیه
- رویدادها
- تعطیلات
- وضعیت روز
- CRM Timeline
- گردش فروش
- گردش تولید
- رابط صنعتی RTL
