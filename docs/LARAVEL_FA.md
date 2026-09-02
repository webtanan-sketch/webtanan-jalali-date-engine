# استفاده از Webtanan Jalali Date Engine در Laravel

## نصب مستقیم از GitHub

تا قبل از انتشار رسمی Packagist:

```bash
composer config repositories.webtanan-jalali vcs https://github.com/webtanan-sketch/webtanan-jalali-date-engine
composer require webtanan/jalali-date-engine:dev-main
```

پس از انتشار رسمی Packagist:

```bash
composer require webtanan/jalali-date-engine
```

## Auto Discovery

Service Provider و Facade در `composer.json` ثبت شده‌اند و Laravel آن‌ها را خودکار شناسایی می‌کند.

## استفاده مستقیم PHP

```php
use Webtanan\JalaliDateEngine\JalaliDate;

echo JalaliDate::format(1405, 6, 11);
```

## استفاده از Facade

```php
echo JalaliDate::format(1405, 6, 11);
```

## انتشار تنظیمات

```bash
php artisan vendor:publish --tag=webtanan-jalali-config
```

فایل زیر ایجاد می‌شود:

```text
config/webtanan-jalali.php
```

تنظیمات اصلی:

- RTL
- اعداد فارسی
- فعال بودن زمان
- نمایش ثانیه
- گام دقیقه
- رویدادها و تعطیلات
- کلید Storage

## انتشار View

```bash
php artisan vendor:publish --tag=webtanan-jalali-views
```

View پیش‌فرض:

```text
webtanan-jalali::datepicker
```

نمونه:

```blade
@include('webtanan-jalali::datepicker', [
    'name' => 'delivery_date',
    'label' => 'تاریخ تحویل',
    'required' => true,
    'time' => true,
])
```

## نکته Frontend

Blade View ساختار ورودی استاندارد را فراهم می‌کند. برای Calendar UI تعاملی، نسخه JavaScript/TypeScript پکیج را نیز در build فرانت‌اند وارد کنید.

## مسیر بعدی Laravel

- Validation Rule تاریخ شمسی
- Form Request helpers
- Cast برای مدل Eloquent
- API Resource helpers
