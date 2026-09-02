<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine;

final class JalaliDate
{
    private const JALALI_BREAKS = [
        -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181,
        1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
    ];

    public const MIN_YEAR = 1;
    public const MAX_YEAR = 3177;

    public static function isValid(int $year, int $month, int $day): bool
    {
        $max = self::daysInMonth($year, $month);
        return $max > 0 && $day >= 1 && $day <= $max;
    }

    public static function daysInMonth(int $year, int $month): int
    {
        if ($year < self::MIN_YEAR || $year > self::MAX_YEAR) return 0;
        if ($month < 1 || $month > 12) return 0;
        if ($month <= 6) return 31;
        if ($month <= 11) return 30;
        return self::isLeapYear($year) ? 30 : 29;
    }

    public static function isValidGregorian(int $year, int $month, int $day): bool
    {
        $max = self::daysInGregorianMonth($year, $month);
        return $max > 0 && $day >= 1 && $day <= $max;
    }

    public static function format(int $year, int $month, int $day, string $separator = '/'): string
    {
        if (!self::isValid($year, $month, $day)) {
            throw new \InvalidArgumentException('تاریخ شمسی نامعتبر است.');
        }

        return sprintf('%04d%s%02d%s%02d', $year, $separator, $month, $separator, $day);
    }

    public static function isLeapYear(int $year): bool
    {
        if ($year < self::MIN_YEAR || $year > self::MAX_YEAR) {
            throw new \InvalidArgumentException('سال شمسی خارج از محدوده پشتیبانی است.');
        }
        return self::jalaliCalculation($year)['leap'] === 0;
    }

    /** @return array{year:int,month:int,day:int} */
    public static function toGregorian(int $year, int $month, int $day): array
    {
        if (!self::isValid($year, $month, $day)) {
            throw new \InvalidArgumentException('تاریخ شمسی نامعتبر است.');
        }

        return self::dayNumberToGregorian(self::jalaliToDayNumber($year, $month, $day));
    }

    public static function toGregorianIso(int $year, int $month, int $day): string
    {
        $date = self::toGregorian($year, $month, $day);
        return sprintf('%04d-%02d-%02d', $date['year'], $date['month'], $date['day']);
    }

    /** @return array{year:int,month:int,day:int} */
    public static function toJalali(int $year, int $month, int $day): array
    {
        if (!self::isValidGregorian($year, $month, $day)) {
            throw new \InvalidArgumentException('تاریخ میلادی نامعتبر است.');
        }

        $result = self::dayNumberToJalali(self::gregorianToDayNumber($year, $month, $day));
        if ($result['year'] < self::MIN_YEAR || $result['year'] > self::MAX_YEAR) {
            throw new \InvalidArgumentException('تاریخ میلادی خارج از محدوده تقویم شمسی پشتیبانی‌شده است.');
        }
        return $result;
    }

    private static function div(int $a, int $b): int
    {
        return intdiv($a, $b);
    }

    private static function mod(int $a, int $b): int
    {
        return $a - self::div($a, $b) * $b;
    }

    private static function isGregorianLeapYear(int $year): bool
    {
        return $year % 4 === 0 && ($year % 100 !== 0 || $year % 400 === 0);
    }

    private static function daysInGregorianMonth(int $year, int $month): int
    {
        if ($month < 1 || $month > 12) return 0;
        if ($month === 2) return self::isGregorianLeapYear($year) ? 29 : 28;
        return in_array($month, [4, 6, 9, 11], true) ? 30 : 31;
    }

    /** @return array{leap:int,gregorianYear:int,marchDay:int} */
    private static function jalaliCalculation(int $year): array
    {
        $firstBreak = self::JALALI_BREAKS[0];
        $lastBreak = self::JALALI_BREAKS[count(self::JALALI_BREAKS) - 1];
        if ($year < $firstBreak || $year >= $lastBreak) {
            throw new \InvalidArgumentException('سال شمسی خارج از محدوده الگوریتم تقویم رسمی است.');
        }

        $gregorianYear = $year + 621;
        $leapJalali = -14;
        $previousBreak = $firstBreak;
        $jump = 0;

        for ($index = 1, $count = count(self::JALALI_BREAKS); $index < $count; $index++) {
            $currentBreak = self::JALALI_BREAKS[$index];
            $jump = $currentBreak - $previousBreak;
            if ($year < $currentBreak) break;
            $leapJalali += self::div($jump, 33) * 8 + self::div(self::mod($jump, 33), 4);
            $previousBreak = $currentBreak;
        }

        $offset = $year - $previousBreak;
        $leapJalali += self::div($offset, 33) * 8 + self::div(self::mod($offset, 33) + 3, 4);
        if (self::mod($jump, 33) === 4 && $jump - $offset === 4) $leapJalali++;

        $leapGregorian = self::div($gregorianYear, 4)
            - self::div((self::div($gregorianYear, 100) + 1) * 3, 4)
            - 150;
        $marchDay = 20 + $leapJalali - $leapGregorian;

        if ($jump - $offset < 6) {
            $offset = $offset - $jump + self::div($jump + 4, 33) * 33;
        }

        $leap = self::mod(self::mod($offset + 1, 33) - 1, 4);
        if ($leap === -1) $leap = 4;

        return compact('leap', 'gregorianYear', 'marchDay');
    }

    private static function gregorianToDayNumber(int $year, int $month, int $day): int
    {
        $value = self::div(($year + self::div($month - 8, 6) + 100100) * 1461, 4)
            + self::div(153 * self::mod($month + 9, 12) + 2, 5)
            + $day
            - 34840408;
        return $value
            - self::div(self::div($year + 100100 + self::div($month - 8, 6), 100) * 3, 4)
            + 752;
    }

    /** @return array{year:int,month:int,day:int} */
    private static function dayNumberToGregorian(int $dayNumber): array
    {
        $value = 4 * $dayNumber + 139361631;
        $value = $value
            + self::div(self::div(4 * $dayNumber + 183187720, 146097) * 3, 4) * 4
            - 3908;
        $intermediate = self::div(self::mod($value, 1461), 4) * 5 + 308;
        $day = self::div(self::mod($intermediate, 153), 5) + 1;
        $month = self::mod(self::div($intermediate, 153), 12) + 1;
        $year = self::div($value, 1461) - 100100 + self::div(8 - $month, 6);
        return compact('year', 'month', 'day');
    }

    private static function jalaliToDayNumber(int $year, int $month, int $day): int
    {
        $calculation = self::jalaliCalculation($year);
        return self::gregorianToDayNumber($calculation['gregorianYear'], 3, $calculation['marchDay'])
            + ($month - 1) * 31
            - self::div($month, 7) * ($month - 7)
            + $day
            - 1;
    }

    /** @return array{year:int,month:int,day:int} */
    private static function dayNumberToJalali(int $dayNumber): array
    {
        $gregorian = self::dayNumberToGregorian($dayNumber);
        $year = $gregorian['year'] - 621;
        $calculation = self::jalaliCalculation($year);
        $firstFarvardin = self::gregorianToDayNumber($gregorian['year'], 3, $calculation['marchDay']);
        $offset = $dayNumber - $firstFarvardin;

        if ($offset >= 0) {
            if ($offset <= 185) {
                $month = 1 + self::div($offset, 31);
                $day = self::mod($offset, 31) + 1;
                return compact('year', 'month', 'day');
            }
            $offset -= 186;
        } else {
            $year--;
            $offset += 179;
            if ($calculation['leap'] === 1) $offset++;
        }

        $month = 7 + self::div($offset, 30);
        $day = self::mod($offset, 30) + 1;
        return compact('year', 'month', 'day');
    }
}
