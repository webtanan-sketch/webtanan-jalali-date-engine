<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine\Laravel;

use Illuminate\Support\ServiceProvider;
use Webtanan\JalaliDateEngine\JalaliDate;

class WebtananJalaliServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__ . '/../../config/webtanan-jalali.php',
            'webtanan-jalali'
        );

        $this->app->singleton('webtanan.jalali', static fn () => new JalaliDate());
    }

    public function boot(): void
    {
        $this->loadViewsFrom(
            __DIR__ . '/../../resources/views',
            'webtanan-jalali'
        );

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../../config/webtanan-jalali.php' => config_path('webtanan-jalali.php'),
            ], 'webtanan-jalali-config');

            $this->publishes([
                __DIR__ . '/../../resources/views' => resource_path('views/vendor/webtanan-jalali'),
            ], 'webtanan-jalali-views');
        }
    }
}
