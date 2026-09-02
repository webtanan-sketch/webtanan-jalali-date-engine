<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/JalaliDate.php';
require_once __DIR__ . '/../src/JalaliValidator.php';
require_once __DIR__ . '/../src/PdoCalendarStateStore.php';

use Webtanan\JalaliDateEngine\JalaliDate;
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
$assertSame(false, JalaliDate::isValid(1405, 7, 31), 'اعتبارسنجی روز شمسی نامعتبر');
$assertSame(false, JalaliDate::isValidGregorian(2026, 2, 29), 'فوریه نامعتبر در سال غیرکبیسه');
$assertSame(true, JalaliDate::isValidGregorian(2028, 2, 29), 'فوریه معتبر در سال کبیسه');
$assertSame(true, JalaliValidator::isValidString('۱۴۰۵/۰۶/۱۱'), 'پذیرش اعداد فارسی');
$assertSame('1405/06/11', JalaliValidator::normalize('۱۴۰۵/۶/۱۱'), 'نرمال‌سازی تاریخ فارسی');
$assertSame(null, JalaliValidator::normalize('1405/07/31'), 'رد تاریخ شمسی نامعتبر');

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
