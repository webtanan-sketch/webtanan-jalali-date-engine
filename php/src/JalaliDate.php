<?php

namespace Webtanan\JalaliDateEngine;

class JalaliDate
{
    public static function isValid(int $year, int $month, int $day): bool
    {
        if ($month < 1 || $month > 12) return false;
        if ($day < 1) return false;

        $max = $month <= 6 ? 31 : ($month <= 11 ? 30 : 30);
        return $day <= $max;
    }

    public static function format(int $year, int $month, int $day): string
    {
        return sprintf('%04d/%02d/%02d', $year, $month, $day);
    }

    public static function isLeapYear(int $year): bool
    {
        return (($year + 38) * 682) % 2816 < 682;
    }
}
