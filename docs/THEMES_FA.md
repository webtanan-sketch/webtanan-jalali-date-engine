# تم‌های حرفه‌ای Webtanan Jalali Date Engine

از نسخه `v0.10.0` سیستم Theme به‌صورت رسمی به پروژه اضافه شده است.

هدف تم‌ها ایجاد ظاهرهای حرفه‌ای، صنعتی، مدیریتی و مناسب نرم‌افزارهای سازمانی است؛ نه تم‌های فانتزی یا تزئینی.

## تم‌های داخلی

### Industrial Light — صنعتی روشن
تم پیش‌فرض پروژه.

مناسب برای:
- CRM
- حسابداری
- فروش
- پنل مدیریت
- نرم‌افزارهای عمومی سازمانی

### Navy Command — فرماندهی سرمه‌ای
ظاهر سرمه‌ای حرفه‌ای با کنتراست کنترل‌شده.

مناسب برای:
- مدیریت کارخانه
- گردش سفارش
- مدیریت فروش
- داشبورد مدیریتی

### Steel Neutral — فولادی خنثی
خاکستری صنعتی و مینیمال.

مناسب برای:
- تولید
- کنترل عملیات
- نگهداری و تعمیرات
- سیستم‌های صنعتی

### Graphite Dark — گرافیتی تیره
تم تیره با خوانایی بالا.

مناسب برای:
- اتاق کنترل
- استفاده طولانی‌مدت
- داشبوردهای مانیتورینگ
- محیط‌های کم‌نور

## استفاده با ThemeManager

```ts
import { ThemeManager } from 'webtanan-jalali-date-engine';

const root = picker.open('#calendar');
if (root) {
  ThemeManager.apply(root, 'navy-command');
}
```

## استفاده در Web Component

```html
<webtanan-jalali-date-picker
  theme="graphite-dark"
></webtanan-jalali-date-picker>
```

## API

```ts
ThemeManager.list();
ThemeManager.get('industrial-light');
ThemeManager.isValid('navy-command');
ThemeManager.apply(element, 'steel-neutral');
ThemeManager.read(element);
```

## اصول طراحی ثابت

- RTL واقعی
- رنگ‌های محدود و هدفمند
- فونت خوانا و وزن مناسب
- کنتراست مناسب وضعیت‌ها
- تعطیلی، جلسه، کار و روز بسته قابل تشخیص
- بدون رنگ‌های تزئینی غیرضروری
- Responsive
- پشتیبانی `prefers-reduced-motion`
- مناسب Desktop، Tablet و Mobile

## توسعه آینده

تم‌های بعدی باید از همین قرارداد پیروی کنند و تنها با تغییر CSS Variables ساخته شوند تا منطق DatePicker به ظاهر وابسته نشود.
