<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine\Laravel;

use Illuminate\Support\ServiceProvider;
use Webtanan\JalaliDateEngine\JalaliDate;

class WebtananJalaliServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('webtanan.jalali', static fn () => new JalaliDate());
    }

    public function boot(): void
    {
        // محل انتشار config، view و asset در نسخه‌های بعدی.
    }
}
