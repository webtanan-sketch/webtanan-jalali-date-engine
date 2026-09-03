# راهنمای دیتابیس Webtanan Jalali Date Engine

این سند معماری ذخیره‌سازی تقویم کاری و Taskها را توضیح می‌دهد.

## انتخاب Storage مناسب

| محیط | پیشنهاد اصلی |
|---|---|
| Browser / PWA | IndexedDB |
| Electron / Node Desktop | SQLite |
| Server / شبکه چندکاربره | MySQL |
| Laravel / PHP Desktop | SQLite از طریق PDO |
| Laravel / PHP Server | MySQL از طریق PDO |
| API جداگانه | RestStorageAdapter / Backend API |

> **نکته امنیتی:** مرورگر نباید مستقیماً با نام کاربری و رمز MySQL به دیتابیس وصل شود. در پروژه وب، اتصال MySQL باید در Backend/Laravel/Node انجام شود و Browser از API استفاده کند.

---

## مدل داده Task

هر Task حداقل این اطلاعات را دارد:

- `id`
- `dateJalali`
- `dateGregorian`
- `title`
- `time`
- `endTime`
- `status`
- `priority`
- `category`
- `assignee`
- `description`
- `color`
- `tags`
- `createdBy`
- `createdAt`
- `updatedAt`
- `completedAt`

تاریخ میلادی هنگام ساخت Task از تاریخ شمسی محاسبه می‌شود تا گزارش‌گیری و اتصال به سیستم‌های خارجی ساده باشد.

---

# Browser — IndexedDB

```ts
import {
  IndexedDbWorkTaskRepository,
  WorkTaskManager,
  WorkTaskPersistence,
} from 'webtanan-jalali-date-engine';

const manager = new WorkTaskManager();
const repository = new IndexedDbWorkTaskRepository({
  databaseName: 'my-company-calendar',
});
const persistence = new WorkTaskPersistence(manager, repository);

await persistence.install();
await persistence.load();

await persistence.add({
  date: '1405/06/11',
  title: 'پیگیری مشتری',
  time: '10:30',
  assignee: 'رضا',
  priority: 'high',
});
```

IndexedDB دارای Indexهای زیر است:

- تاریخ شمسی
- وضعیت
- مسئول
- دسته‌بندی

---

# Electron / Node — SQLite

هسته پروژه وابستگی اجباری به `better-sqlite3` ندارد. Driver از برنامه میزبان تزریق می‌شود.

نصب Driver در پروژه مصرف‌کننده:

```bash
npm install better-sqlite3
```

نمونه:

```ts
import Database from 'better-sqlite3';
import {
  BetterSqlite3Executor,
  SqlWorkTaskRepository,
  WorkTaskManager,
  WorkTaskPersistence,
} from 'webtanan-jalali-date-engine';

const database = new Database('./data/calendar.sqlite');
const executor = new BetterSqlite3Executor(database);
const repository = new SqlWorkTaskRepository(executor, {
  dialect: 'sqlite',
});

const manager = new WorkTaskManager();
const persistence = new WorkTaskPersistence(manager, repository);

await persistence.install();
await persistence.load();
```

SQLite برای نرم‌افزار تک‌سیستمی، Portable یا Electron گزینه پیشنهادی است.

---

# Node Server — MySQL

Driver پیشنهادی در برنامه مصرف‌کننده:

```bash
npm install mysql2
```

نمونه:

```ts
import mysql from 'mysql2/promise';
import {
  Mysql2Executor,
  SqlWorkTaskRepository,
} from 'webtanan-jalali-date-engine';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
});

const executor = new Mysql2Executor(pool);
const repository = new SqlWorkTaskRepository(executor, {
  dialect: 'mysql',
});

await repository.install();
```

اطلاعات اتصال باید در Environment Variable یا Secret Manager نگهداری شود؛ نه داخل Source Code یا Browser Bundle.

---

# PHP / Laravel — SQLite محلی

```php
use Webtanan\JalaliDateEngine\PdoConnectionFactory;
use Webtanan\JalaliDateEngine\PdoWorkTaskRepository;

$pdo = PdoConnectionFactory::sqlite(storage_path('app/calendar.sqlite'));
$tasks = new PdoWorkTaskRepository($pdo);
$tasks->install();

$tasks->put([
    'id' => 'task-100',
    'dateJalali' => '1405/06/11',
    'title' => 'پیگیری مشتری',
    'priority' => 'high',
]);
```

---

# PHP / Laravel — MySQL

```php
$pdo = PdoConnectionFactory::mysql(
    host: env('DB_HOST', '127.0.0.1'),
    database: env('DB_DATABASE'),
    username: env('DB_USERNAME'),
    password: env('DB_PASSWORD'),
    port: (int) env('DB_PORT', 3306),
);

$tasks = new PdoWorkTaskRepository($pdo);
$tasks->install();
```

در Laravel می‌توان به‌جای ساخت PDO جدید، PDO اتصال موجود Laravel را نیز به Repository تزریق کرد.

---

# Query نمونه

```ts
const monthTasks = await repository.query({
  from: '1405/06/01',
  to: '1405/06/31',
});

const customerFollowups = await repository.query({
  category: 'فروش',
  assignee: 'رضا',
  status: ['todo', 'in_progress'],
});
```

---

# Backup / Restore

```ts
import { WorkTaskBackup } from 'webtanan-jalali-date-engine';

const backup = WorkTaskBackup.create(manager, {
  company: 'Example Company',
});

const json = WorkTaskBackup.stringify(backup);
```

بازیابی:

```ts
const parsed = WorkTaskBackup.parse(json);
await WorkTaskBackup.restore(parsed, manager, repository);
```

Backup دارای `schemaVersion` است تا تغییرات نسخه‌های آینده قابل مدیریت باشد.

---

# سیاست Migration

- Schema Taskها از API عمومی نسخه‌بندی می‌شود.
- تغییرات ناسازگار دیتابیس فقط همراه Migration رسمی انجام خواهند شد.
- Backup قبل از Migration برای نرم‌افزارهای Desktop توصیه می‌شود.
- تاریخ شمسی و میلادی هر دو ذخیره می‌شوند.
- `createdAt` و `updatedAt` برای Audit حفظ می‌شوند.

---

# انتخاب پیشنهادی Webtanan

برای نرم‌افزار Desktop تک‌کاربره:

**SQLite**

برای CRM یا سیستم شبکه‌ای چندکاربره:

**MySQL**

برای Web/PWA آفلاین:

**IndexedDB + Sync API**
