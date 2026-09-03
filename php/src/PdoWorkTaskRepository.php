<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine;

use PDO;
use PDOException;

final class PdoWorkTaskRepository
{
    private string $driver;

    public function __construct(
        private readonly PDO $pdo,
        private readonly string $table = 'webtanan_calendar_tasks'
    ) {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $this->table)) {
            throw new \InvalidArgumentException('نام جدول Task نامعتبر است.');
        }
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $this->driver = (string) $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if (!in_array($this->driver, ['sqlite', 'mysql'], true)) {
            throw new \RuntimeException('PdoWorkTaskRepository فقط SQLite و MySQL را پشتیبانی می‌کند.');
        }
    }

    public function install(): void
    {
        if ($this->driver === 'mysql') {
            $this->pdo->exec(sprintf(
                'CREATE TABLE IF NOT EXISTS %s (
                    id VARCHAR(191) PRIMARY KEY,
                    date_jalali VARCHAR(10) NOT NULL,
                    date_gregorian VARCHAR(10) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    time_value VARCHAR(8) NULL,
                    end_time VARCHAR(8) NULL,
                    status VARCHAR(20) NOT NULL,
                    priority VARCHAR(20) NOT NULL,
                    category VARCHAR(191) NULL,
                    assignee VARCHAR(191) NULL,
                    description TEXT NULL,
                    color VARCHAR(40) NULL,
                    tags_json TEXT NOT NULL,
                    created_by VARCHAR(191) NULL,
                    created_at VARCHAR(40) NOT NULL,
                    updated_at VARCHAR(40) NOT NULL,
                    completed_at VARCHAR(40) NULL,
                    INDEX idx_%1$s_date (date_jalali),
                    INDEX idx_%1$s_status (status),
                    INDEX idx_%1$s_assignee (assignee)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
                $this->table
            ));
            return;
        }

        $this->pdo->exec(sprintf(
            'CREATE TABLE IF NOT EXISTS %s (
                id TEXT PRIMARY KEY,
                date_jalali TEXT NOT NULL,
                date_gregorian TEXT NOT NULL,
                title TEXT NOT NULL,
                time_value TEXT NULL,
                end_time TEXT NULL,
                status TEXT NOT NULL,
                priority TEXT NOT NULL,
                category TEXT NULL,
                assignee TEXT NULL,
                description TEXT NULL,
                color TEXT NULL,
                tags_json TEXT NOT NULL,
                created_by TEXT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                completed_at TEXT NULL
            )',
            $this->table
        ));
        $this->pdo->exec(sprintf('CREATE INDEX IF NOT EXISTS idx_%1$s_date ON %1$s(date_jalali)', $this->table));
        $this->pdo->exec(sprintf('CREATE INDEX IF NOT EXISTS idx_%1$s_status ON %1$s(status)', $this->table));
        $this->pdo->exec(sprintf('CREATE INDEX IF NOT EXISTS idx_%1$s_assignee ON %1$s(assignee)', $this->table));
    }

    /** @param array<string, mixed> $task */
    public function put(array $task): void
    {
        $record = $this->normalizeTask($task);
        $columns = [
            'id', 'date_jalali', 'date_gregorian', 'title', 'time_value', 'end_time', 'status', 'priority',
            'category', 'assignee', 'description', 'color', 'tags_json', 'created_by', 'created_at', 'updated_at', 'completed_at'
        ];
        $params = [];
        foreach ($columns as $column) {
            $params[$column] = $record[$column];
        }

        $updateAssignments = implode(', ', array_map(
            static fn (string $column): string => $column . ' = :' . $column,
            array_filter($columns, static fn (string $column): bool => $column !== 'id')
        ));

        $update = $this->pdo->prepare(sprintf(
            'UPDATE %s SET %s WHERE id = :id',
            $this->table,
            $updateAssignments
        ));
        $update->execute($params);
        if ($update->rowCount() > 0 || $this->exists((string) $record['id'])) {
            return;
        }

        try {
            $insert = $this->pdo->prepare(sprintf(
                'INSERT INTO %s (%s) VALUES (%s)',
                $this->table,
                implode(', ', $columns),
                implode(', ', array_map(static fn (string $column): string => ':' . $column, $columns))
            ));
            $insert->execute($params);
        } catch (PDOException $exception) {
            // رقابت هم‌زمان: اگر رکورد بین UPDATE و INSERT ایجاد شد دوباره UPDATE می‌کنیم.
            $retry = $this->pdo->prepare(sprintf(
                'UPDATE %s SET %s WHERE id = :id',
                $this->table,
                $updateAssignments
            ));
            $retry->execute($params);
            if ($retry->rowCount() === 0 && !$this->exists((string) $record['id'])) {
                throw $exception;
            }
        }
    }

    /** @param list<array<string, mixed>> $tasks */
    public function putMany(array $tasks): void
    {
        $this->pdo->beginTransaction();
        try {
            foreach ($tasks as $task) {
                $this->put($task);
            }
            $this->pdo->commit();
        } catch (\Throwable $exception) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $exception;
        }
    }

    /** @return array<string, mixed>|null */
    public function get(string $id): ?array
    {
        $statement = $this->pdo->prepare(sprintf('SELECT * FROM %s WHERE id = :id LIMIT 1', $this->table));
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();
        return $row === false ? null : $this->hydrate($row);
    }

    public function delete(string $id): bool
    {
        $statement = $this->pdo->prepare(sprintf('DELETE FROM %s WHERE id = :id', $this->table));
        $statement->execute(['id' => $id]);
        return $statement->rowCount() > 0;
    }

    /**
     * @param array{from?:string,to?:string,status?:string|list<string>,assignee?:string,category?:string,search?:string,limit?:int,offset?:int} $query
     * @return list<array<string, mixed>>
     */
    public function query(array $query = []): array
    {
        $where = [];
        $params = [];
        if (isset($query['from'])) {
            $where[] = 'date_jalali >= :from_date';
            $params['from_date'] = JalaliValidator::normalize((string) $query['from']) ?? throw new \InvalidArgumentException('تاریخ from نامعتبر است.');
        }
        if (isset($query['to'])) {
            $where[] = 'date_jalali <= :to_date';
            $params['to_date'] = JalaliValidator::normalize((string) $query['to']) ?? throw new \InvalidArgumentException('تاریخ to نامعتبر است.');
        }
        if (isset($query['assignee'])) {
            $where[] = 'assignee = :assignee';
            $params['assignee'] = (string) $query['assignee'];
        }
        if (isset($query['category'])) {
            $where[] = 'category = :category';
            $params['category'] = (string) $query['category'];
        }
        if (isset($query['status'])) {
            $statuses = is_array($query['status']) ? array_values($query['status']) : [(string) $query['status']];
            if ($statuses !== []) {
                $holders = [];
                foreach ($statuses as $index => $status) {
                    $key = 'status_' . $index;
                    $holders[] = ':' . $key;
                    $params[$key] = (string) $status;
                }
                $where[] = 'status IN (' . implode(',', $holders) . ')';
            }
        }
        if (isset($query['search']) && trim((string) $query['search']) !== '') {
            $where[] = '(title LIKE :search OR description LIKE :search OR assignee LIKE :search OR category LIKE :search)';
            $params['search'] = '%' . trim((string) $query['search']) . '%';
        }

        $sql = sprintf(
            'SELECT * FROM %s%s ORDER BY date_jalali ASC, time_value ASC, id ASC',
            $this->table,
            $where === [] ? '' : ' WHERE ' . implode(' AND ', $where)
        );
        $limit = isset($query['limit']) ? max(0, (int) $query['limit']) : null;
        $offset = isset($query['offset']) ? max(0, (int) $query['offset']) : 0;
        if ($limit !== null) {
            $sql .= ' LIMIT ' . $limit . ' OFFSET ' . $offset;
        }

        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);
        $rows = $statement->fetchAll();
        return array_map(fn (array $row): array => $this->hydrate($row), $rows);
    }

    /** @param array<string, mixed> $query */
    public function count(array $query = []): int
    {
        return count($this->query(array_diff_key($query, ['limit' => true, 'offset' => true])));
    }

    public function clear(): void
    {
        $this->pdo->exec(sprintf('DELETE FROM %s', $this->table));
    }

    private function exists(string $id): bool
    {
        $statement = $this->pdo->prepare(sprintf('SELECT 1 FROM %s WHERE id = :id LIMIT 1', $this->table));
        $statement->execute(['id' => $id]);
        return $statement->fetchColumn() !== false;
    }

    /** @param array<string, mixed> $task @return array<string, mixed> */
    private function normalizeTask(array $task): array
    {
        $id = trim((string) ($task['id'] ?? ''));
        $dateJalali = JalaliValidator::normalize((string) ($task['dateJalali'] ?? $task['date_jalali'] ?? ''));
        $title = trim((string) ($task['title'] ?? ''));
        if ($id === '' || strlen($id) > 191) throw new \InvalidArgumentException('شناسه Task نامعتبر است.');
        if ($dateJalali === null) throw new \InvalidArgumentException('تاریخ شمسی Task نامعتبر است.');
        if ($title === '') throw new \InvalidArgumentException('عنوان Task الزامی است.');
        [$year, $month, $day] = array_map('intval', explode('/', $dateJalali));
        $dateGregorian = JalaliDate::toGregorianIso($year, $month, $day);
        $tags = $task['tags'] ?? [];
        if (!is_array($tags)) $tags = [];
        $now = gmdate('c');
        $status = (string) ($task['status'] ?? 'todo');
        if (!in_array($status, ['todo', 'in_progress', 'done', 'cancelled'], true)) throw new \InvalidArgumentException('وضعیت Task نامعتبر است.');
        $priority = (string) ($task['priority'] ?? 'normal');
        if (!in_array($priority, ['low', 'normal', 'high', 'urgent'], true)) throw new \InvalidArgumentException('اولویت Task نامعتبر است.');

        return [
            'id' => $id,
            'date_jalali' => $dateJalali,
            'date_gregorian' => $dateGregorian,
            'title' => $title,
            'time_value' => $this->nullableString($task['time'] ?? $task['time_value'] ?? null),
            'end_time' => $this->nullableString($task['endTime'] ?? $task['end_time'] ?? null),
            'status' => $status,
            'priority' => $priority,
            'category' => $this->nullableString($task['category'] ?? null),
            'assignee' => $this->nullableString($task['assignee'] ?? null),
            'description' => $this->nullableString($task['description'] ?? null),
            'color' => $this->nullableString($task['color'] ?? null),
            'tags_json' => json_encode(array_values(array_unique(array_map('strval', $tags))), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            'created_by' => $this->nullableString($task['createdBy'] ?? $task['created_by'] ?? null),
            'created_at' => (string) ($task['createdAt'] ?? $task['created_at'] ?? $now),
            'updated_at' => (string) ($task['updatedAt'] ?? $task['updated_at'] ?? $now),
            'completed_at' => $this->nullableString($task['completedAt'] ?? $task['completed_at'] ?? ($status === 'done' ? $now : null)),
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function hydrate(array $row): array
    {
        $tags = json_decode((string) ($row['tags_json'] ?? '[]'), true);
        if (!is_array($tags)) $tags = [];
        return [
            'id' => (string) $row['id'],
            'dateJalali' => (string) $row['date_jalali'],
            'dateGregorian' => (string) $row['date_gregorian'],
            'title' => (string) $row['title'],
            'time' => $row['time_value'] !== null ? (string) $row['time_value'] : null,
            'endTime' => $row['end_time'] !== null ? (string) $row['end_time'] : null,
            'status' => (string) $row['status'],
            'priority' => (string) $row['priority'],
            'category' => $row['category'] !== null ? (string) $row['category'] : null,
            'assignee' => $row['assignee'] !== null ? (string) $row['assignee'] : null,
            'description' => $row['description'] !== null ? (string) $row['description'] : null,
            'color' => $row['color'] !== null ? (string) $row['color'] : null,
            'tags' => array_values(array_map('strval', $tags)),
            'createdBy' => $row['created_by'] !== null ? (string) $row['created_by'] : null,
            'createdAt' => (string) $row['created_at'],
            'updatedAt' => (string) $row['updated_at'],
            'completedAt' => $row['completed_at'] !== null ? (string) $row['completed_at'] : null,
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null) return null;
        $string = trim((string) $value);
        return $string === '' ? null : $string;
    }
}
