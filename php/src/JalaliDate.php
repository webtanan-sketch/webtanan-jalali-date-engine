<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine;

final class JalaliDate
{
    private const PERSIAN_EPOCH = 1948320.5;
    private const GREGORIAN_EPOCH = 1721425.5;

    public static function isValid(int $year, int $month, int $day): bool
    {
        $max = self::daysInMonth($year, $month);
        return $year !== 0 && $max > 0 && $day >= 1 && $day <= $max;
    }

    public static function daysInMonth(int $year, int $month): int
    {
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
        $start = self::jalaliToJd($year, 1, 1);
        $next = self::jalaliToJd($year + 1, 1, 1);
        return (int) round($next - $start) === 366;
    }

    /** @return array{year:int,month:int,day:int} */
    public static function toGregorian(int $year, int $month, int $day): array
    {
        if (!self::isValid($year, $month, $day)) {
            throw new \InvalidArgumentException('تاریخ شمسی نامعتبر است.');
        }

        return self::jdToGregorian(self::jalaliToJd($year, $month, $day));
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

        return self::jdToJalali(self::gregorianToJd($year, $month, $day));
    }

    private static function mod(float $a, float $b): float
    {
        return $a - $b * floor($a / $b);
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

    private static function gregorianToJd(int $year, int $month, int $day): float
    {
        $adjustment = $month <= 2 ? 0 : (self::isGregorianLeapYear($year) ? -1 : -2);

        return self::GREGORIAN_EPOCH - 1
            + 365 * ($year - 1)
            + floor(($year - 1) / 4)
            - floor(($year - 1) / 100)
            + floor(($year - 1) / 400)
            + floor(((367 * $month - 362) / 12) + $adjustment + $day);
    }

    /** @return array{year:int,month:int,day:int} */
    private static function jdToGregorian(float $jd): array
    {
        $wjd = floor($jd - 0.5) + 0.5;
        $depoch = $wjd - self::GREGORIAN_EPOCH;
        $quadricent = floor($depoch / 146097);
        $dqc = self::mod($depoch, 146097);
        $cent = floor($dqc / 36524);
        $dcent = self::mod($dqc, 36524);
        $quad = floor($dcent / 1461);
        $dquad = self::mod($dcent, 1461);
        $yindex = floor($dquad / 365);

        $year = (int) ($quadricent * 400 + $cent * 100 + $quad * 4 + $yindex);
        if (!($cent === 4.0 || $yindex === 4.0)) $year++;

        $yearday = $wjd - self::gregorianToJd($year, 1, 1);
        $leapadj = $wjd < self::gregorianToJd($year, 3, 1)
            ? 0
            : (self::isGregorianLeapYear($year) ? 1 : 2);
        $month = (int) floor((($yearday + $leapadj) * 12 + 373) / 367);
        $day = (int) floor($wjd - self::gregorianToJd($year, $month, 1) + 1);

        return compact('year', 'month', 'day');
    }

    private static function jalaliToJd(int $year, int $month, int $day): float
    {
        $epbase = $year - ($year >= 0 ? 474 : 473);
        $epyear = 474 + self::mod($epbase, 2820);
        $mdays = $month <= 7 ? ($month - 1) * 31 : ($month - 1) * 30 + 6;

        return $day
            + $mdays
            + floor(($epyear * 682 - 110) / 2816)
            + ($epyear - 1) * 365
            + floor($epbase / 2820) * 1029983
            + (self::PERSIAN_EPOCH - 1);
    }

    /** @return array{year:int,month:int,day:int} */
    private static function jdToJalali(float $jd): array
    {
        $normalized = floor($jd) + 0.5;
        $depoch = $normalized - self::jalaliToJd(475, 1, 1);
        $cycle = floor($depoch / 1029983);
        $cyear = self::mod($depoch, 1029983);

        if ($cyear === 1029982.0) {
            $ycycle = 2820;
        } else {
            $aux1 = floor($cyear / 366);
            $aux2 = self::mod($cyear, 366);
            $ycycle = floor((2134 * $aux1 + 2816 * $aux2 + 2815) / 1028522) + $aux1 + 1;
        }

        $year = (int) ($ycycle + 2820 * $cycle + 474);
        if ($year <= 0) $year--;

        $yday = (int) floor($normalized - self::jalaliToJd($year, 1, 1) + 1);
        $month = $yday <= 186 ? (int) ceil($yday / 31) : (int) ceil(($yday - 6) / 30);
        $day = (int) floor($normalized - self::jalaliToJd($year, $month, 1) + 1);

        return compact('year', 'month', 'day');
    }
}
