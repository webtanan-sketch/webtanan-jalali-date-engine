<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine;

use PDO;

final class PdoConnectionFactory
{
    /** @param array<int, mixed> $options */
    public static function sqlite(string $path = ':memory:', array $options = []): PDO
    {
        if ($path !== ':memory:') {
            $directory = dirname($path);
            if (!is_dir($directory) && !@mkdir($directory, 0775, true) && !is_dir($directory)) {
                throw new \RuntimeException('ساخت پوشه دیتابیس SQLite ممکن نشد.');
            }
        }

        return self::configure(new PDO('sqlite:' . $path, null, null, $options));
    }

    /** @param array<int, mixed> $options */
    public static function mysql(
        string $host,
        string $database,
        string $username,
        string $password,
        int $port = 3306,
        string $charset = 'utf8mb4',
        array $options = []
    ): PDO {
        if ($host === '' || $database === '' || $username === '') {
            throw new \InvalidArgumentException('host، database و username برای MySQL الزامی هستند.');
        }
        if ($port < 1 || $port > 65535) {
            throw new \InvalidArgumentException('پورت MySQL نامعتبر است.');
        }
        if (!preg_match('/^[A-Za-z0-9_\-]+$/', $charset)) {
            throw new \InvalidArgumentException('charset نامعتبر است.');
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $host,
            $port,
            $database,
            $charset
        );

        return self::configure(new PDO($dsn, $username, $password, $options));
    }

    private static function configure(PDO $pdo): PDO
    {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        if ((string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql') {
            $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        }
        return $pdo;
    }
}
