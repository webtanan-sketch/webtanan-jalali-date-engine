<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine\Laravel;

use Illuminate\Support\Facades\Facade;

class JalaliDateFacade extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'webtanan.jalali';
    }
}
