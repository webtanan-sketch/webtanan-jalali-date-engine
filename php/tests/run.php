<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/JalaliDate.php';

use Webtanan\JalaliDateEngine\JalaliDate;

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
$assertSame(false, JalaliDate::isValid(1405, 7, 31), 'اعتبارسنجی روز نامعتبر');

if ($failures !== []) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo "PHP Jalali tests passed." . PHP_EOL;
