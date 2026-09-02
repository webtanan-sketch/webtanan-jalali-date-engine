<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine;

final class JalaliValidator
{
    public static function normalizeDigits(string $value): string
    {
        return strtr($value, [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);
    }

    /** @return array{year:int,month:int,day:int}|null */
    public static function parse(string $value): ?array
    {
        $normalized = trim(self::normalizeDigits($value));
        if (!preg_match('/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/', $normalized, $matches)) {
            return null;
        }

        $year = (int) $matches[1];
        $month = (int) $matches[2];
        $day = (int) $matches[3];

        if (!JalaliDate::isValid($year, $month, $day)) {
            return null;
        }

        return compact('year', 'month', 'day');
    }

    public static function isValidString(string $value): bool
    {
        return self::parse($value) !== null;
    }

    public static function normalize(string $value): ?string
    {
        $date = self::parse($value);
        if ($date === null) {
            return null;
        }

        return JalaliDate::format($date['year'], $date['month'], $date['day']);
    }
}
