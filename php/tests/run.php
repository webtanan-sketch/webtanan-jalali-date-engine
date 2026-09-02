<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/JalaliDate.php';
require_once __DIR__ . '/../src/JalaliYearInfo.php';
require_once __DIR__ . '/../src/JalaliValidator.php';
require_once __DIR__ . '/../src/PdoCalendarStateStore.php';

use Webtanan\JalaliDateEngine\JalaliDate;
use Webtanan\JalaliDateEngine\JalaliYearInfo;
use Webtanan\JalaliDateEngine\JalaliValidator;
use Webtanan\JalaliDateEngine\PdoCalendarStateStore;

$failures = [];

$assertSame = static function ($expected, $actual, string $message) use (&$failures): void {
    if ($expected !== $actual) {
        $failures[] = $message . ' | expected=' . var_export($expected, true) . ' actual=' . var_export($actual, true);
    }
};

$assertSame('2026-03-21', JalaliDate::toGregorianIso(1405, 1, 1), 'تبدیل نوروز ۱۴۰۵');
$assertSame(
    ['year' => 1405, 'month' => 6, 'day' => 11],
    JalaliDate::toJalali(2026, 9, 2),
    'تبدیل میلادی به شمسی'
);

$assertSame(true, JalaliDate::isLeapYear(1403), '۱۴۰۳ باید کبیسه باشد');
$assertSame(false, JalaliDate::isLeapYear(1404), '۱۴۰۴ نباید کبیسه باشد');
$assertSame('2025-03-20', JalaliDate::toGregorianIso(1403, 12, 30), 'مرز ۱۴۰۳/۱۴۰۴');
$assertSame('2025-03-21', JalaliDate::toGregorianIso(1404, 1, 1), 'اول فروردین ۱۴۰۴');
$assertSame(false, JalaliDate::isValid(1404, 12, 30), 'اسفند ۱۴۰۴ روز ۳۰ ندارد');
$assertSame('2026-03-20', JalaliDate::toGregorianIso(1404, 12, 29), 'آخر اسفند ۱۴۰۴');
$assertSame(
    ['year' => 1404, 'month' => 12, 'day' => 29],
    JalaliDate::toJalali(2026, 3, 20),
    '۲۰ مارس ۲۰۲۶ برابر ۲۹ اسفند ۱۴۰۴'
);
$assertSame(true, JalaliDate::isLeapYear(1399), '۱۳۹۹ باید کبیسه باشد');
$assertSame('2021-03-20', JalaliDate::toGregorianIso(1399, 12, 30), 'مرز سال ۱۳۹۹');

// سال‌های قدیمی نیز از همان الگوریتم عمومی استفاده می‌کنند.
$assertSame(false, JalaliDate::isLeapYear(1360), '۱۳۶۰ باید سال عادی باشد');
$assertSame(true, JalaliDate::isLeapYear(1358), '۱۳۵۸ باید کبیسه باشد');
$assertSame(true, JalaliDate::isLeapYear(1362), '۱۳۶۲ باید کبیسه باشد');
$assertSame(29, JalaliDate::daysInMonth(1360, 12), 'اسفند ۱۳۶۰ باید ۲۹ روز داشته باشد');
$assertSame(false, JalaliDate::isValid(1360, 12, 30), '۳۰ اسفند ۱۳۶۰ نامعتبر است');
$assertSame('1981-03-21', JalaliDate::toGregorianIso(1360, 1, 1), 'اول فروردین ۱۳۶۰');
$assertSame('1982-03-20', JalaliDate::toGregorianIso(1360, 12, 29), 'آخر اسفند ۱۳۶۰');
$assertSame(
    [
        'year' => 1360,
        'isLeap' => false,
        'leapStatusFa' => 'عادی',
        'daysInYear' => 365,
        'esfandDays' => 29,
        'farvardin1GregorianISO' => '1981-03-21',
        'lastDayGregorianISO' => '1982-03-20',
    ],
    JalaliYearInfo::get(1360),
    'اطلاعات کامل سال ۱۳۶۰'
);

// invariant عمومی کل محدوده پشتیبانی‌شده.
for ($year = JalaliDate::MIN_YEAR; $year <= JalaliDate::MAX_YEAR; $year++) {
    $leap = JalaliDate::isLeapYear($year);
    $expectedEsfand = $leap ? 30 : 29;
    $assertSame($expectedEsfand, JalaliDate::daysInMonth($year, 12), "تعداد روز اسفند سال {$year}");
    $assertSame($leap ? 366 : 365, JalaliYearInfo::daysInYear($year), "تعداد روز سال {$year}");
    $assertSame(true, JalaliDate::isValid($year, 12, $expectedEsfand), "آخر اسفند سال {$year}");
    if (!$leap) {
        $assertSame(false, JalaliDate::isValid($year, 12, 30), "رد ۳۰ اسفند سال عادی {$year}");
    }
}

$assertSame(false, JalaliDate::isValid(1405, 7, 31), 'اعتبارسنجی روز شمسی نامعتبر');
$assertSame(false, JalaliDate::isValidGregorian(2026, 2, 29), 'فوریه نامعتبر در سال غیرکبیسه');
$assertSame(true, JalaliDate::isValidGregorian(2028, 2, 29), 'فوریه معتبر در سال کبیسه');
$assertSame(true, JalaliValidator::isValidString('۱۴۰۵/۰۶/۱۱'), 'پذیرش اعداد فارسی');
$assertSame('1405/06/11', JalaliValidator::normalize('۱۴۰۵/۶/۱۱'), 'نرمال‌سازی تاریخ فارسی');
$assertSame(null, JalaliValidator::normalize('1405/07/31'), 'رد تاریخ شمسی نامعتبر');
$assertSame(null, JalaliValidator::normalize('1404/12/30'), 'رد اسفند ۳۰ در سال غیرکبیسه');

if (in_array('sqlite', PDO::getAvailableDrivers(), true)) {
    $pdo = new PDO('sqlite::memory:');
    $store = new PdoCalendarStateStore($pdo);
    $store->install();
    $store->put('crm:12', '{"date":"1405/06/11"}');
    $assertSame('{"date":"1405/06/11"}', $store->get('crm:12'), 'ذخیره PDO');
    $store->put('crm:12', '{"date":"1405/06/12"}');
    $assertSame('{"date":"1405/06/12"}', $store->get('crm:12'), 'به‌روزرسانی PDO');
    $store->delete('crm:12');
    $assertSame(null, $store->get('crm:12'), 'حذف PDO');
}

if ($failures !== []) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo "PHP Jalali tests passed." . PHP_EOL;
