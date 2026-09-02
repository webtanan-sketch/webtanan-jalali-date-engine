<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine;

final class JalaliYearInfo
{
    /**
     * @return array{
     *   year:int,
     *   isLeap:bool,
     *   leapStatusFa:string,
     *   daysInYear:int,
     *   esfandDays:int,
     *   farvardin1GregorianISO:string,
     *   lastDayGregorianISO:string
     * }
     */
    public static function get(int $year): array
    {
        $isLeap = JalaliDate::isLeapYear($year);
        $esfandDays = $isLeap ? 30 : 29;

        return [
            'year' => $year,
            'isLeap' => $isLeap,
            'leapStatusFa' => $isLeap ? 'کبیسه' : 'عادی',
            'daysInYear' => $isLeap ? 366 : 365,
            'esfandDays' => $esfandDays,
            'farvardin1GregorianISO' => JalaliDate::toGregorianIso($year, 1, 1),
            'lastDayGregorianISO' => JalaliDate::toGregorianIso($year, 12, $esfandDays),
        ];
    }

    public static function isLeap(int $year): bool
    {
        return JalaliDate::isLeapYear($year);
    }

    public static function daysInYear(int $year): int
    {
        return JalaliDate::isLeapYear($year) ? 366 : 365;
    }

    public static function esfandDays(int $year): int
    {
        return JalaliDate::isLeapYear($year) ? 30 : 29;
    }
}
