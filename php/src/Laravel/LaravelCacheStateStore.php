<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine\Laravel;

use Illuminate\Contracts\Cache\Repository as CacheRepository;

final class LaravelCacheStateStore
{
    public function __construct(
        private readonly CacheRepository $cache,
        private readonly string $prefix = 'webtanan:jalali:'
    ) {
    }

    public function get(string $key): ?string
    {
        $value = $this->cache->get($this->key($key));
        return $value === null ? null : (string) $value;
    }

    public function put(string $key, string $payload, int|\DateInterval|null $ttl = null): void
    {
        $cacheKey = $this->key($key);
        if ($ttl === null) {
            $this->cache->forever($cacheKey, $payload);
            return;
        }
        $this->cache->put($cacheKey, $payload, $ttl);
    }

    public function delete(string $key): void
    {
        $this->cache->forget($this->key($key));
    }

    private function key(string $key): string
    {
        $normalized = trim($key);
        if ($normalized === '') throw new \InvalidArgumentException('کلید Cache نمی‌تواند خالی باشد.');
        return $this->prefix . $normalized;
    }
}
