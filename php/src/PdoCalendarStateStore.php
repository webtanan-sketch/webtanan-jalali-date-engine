<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine;

use PDO;

final class PdoCalendarStateStore
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly string $table = 'webtanan_jalali_state'
    ) {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $this->table)) {
            throw new \InvalidArgumentException('نام جدول نامعتبر است.');
        }
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function install(): void
    {
        $sql = sprintf(
            'CREATE TABLE IF NOT EXISTS %s (storage_key VARCHAR(191) PRIMARY KEY, payload TEXT NOT NULL, updated_at VARCHAR(40) NOT NULL)',
            $this->table
        );
        $this->pdo->exec($sql);
    }

    public function get(string $key): ?string
    {
        $this->assertKey($key);
        $statement = $this->pdo->prepare(sprintf('SELECT payload FROM %s WHERE storage_key = :key', $this->table));
        $statement->execute(['key' => $key]);
        $value = $statement->fetchColumn();
        return $value === false ? null : (string) $value;
    }

    public function put(string $key, string $payload): void
    {
        $this->assertKey($key);
        $now = gmdate('c');

        $update = $this->pdo->prepare(
            sprintf('UPDATE %s SET payload = :payload, updated_at = :updated_at WHERE storage_key = :key', $this->table)
        );
        $update->execute(['key' => $key, 'payload' => $payload, 'updated_at' => $now]);

        if ($update->rowCount() > 0) return;

        try {
            $insert = $this->pdo->prepare(
                sprintf('INSERT INTO %s (storage_key, payload, updated_at) VALUES (:key, :payload, :updated_at)', $this->table)
            );
            $insert->execute(['key' => $key, 'payload' => $payload, 'updated_at' => $now]);
        } catch (\PDOException $exception) {
            // در رقابت هم‌زمان ممکن است رکورد بین UPDATE و INSERT ساخته شده باشد.
            $retry = $this->pdo->prepare(
                sprintf('UPDATE %s SET payload = :payload, updated_at = :updated_at WHERE storage_key = :key', $this->table)
            );
            $retry->execute(['key' => $key, 'payload' => $payload, 'updated_at' => $now]);
            if ($retry->rowCount() === 0) throw $exception;
        }
    }

    public function delete(string $key): void
    {
        $this->assertKey($key);
        $statement = $this->pdo->prepare(sprintf('DELETE FROM %s WHERE storage_key = :key', $this->table));
        $statement->execute(['key' => $key]);
    }

    private function assertKey(string $key): void
    {
        if (trim($key) === '' || strlen($key) > 191) {
            throw new \InvalidArgumentException('کلید Storage باید بین ۱ تا ۱۹۱ کاراکتر باشد.');
        }
    }
}
