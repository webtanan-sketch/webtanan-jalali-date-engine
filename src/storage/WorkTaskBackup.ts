import type { WorkTaskRecord } from '../work/WorkTask';
import { WorkTaskManager } from '../work/WorkTaskManager';
import type { WorkTaskRepository } from './WorkTaskRepository';

export const WORK_TASK_BACKUP_SCHEMA_VERSION = 1 as const;

export interface WorkTaskBackupEnvelope {
  schemaVersion: typeof WORK_TASK_BACKUP_SCHEMA_VERSION;
  engine: 'webtanan-jalali-date-engine';
  exportedAt: string;
  taskCount: number;
  metadata?: Record<string, string | number | boolean | null>;
  tasks: WorkTaskRecord[];
}

export interface RestoreWorkTaskBackupOptions {
  replaceManager?: boolean;
  replaceRepository?: boolean;
}

export class WorkTaskBackup {
  static create(
    manager: WorkTaskManager,
    metadata?: WorkTaskBackupEnvelope['metadata'],
    now = new Date(),
  ): WorkTaskBackupEnvelope {
    const tasks = manager.toJSON();
    return {
      schemaVersion: WORK_TASK_BACKUP_SCHEMA_VERSION,
      engine: 'webtanan-jalali-date-engine',
      exportedAt: now.toISOString(),
      taskCount: tasks.length,
      metadata: metadata ? { ...metadata } : undefined,
      tasks,
    };
  }

  static stringify(envelope: WorkTaskBackupEnvelope, pretty = true): string {
    this.validate(envelope);
    return JSON.stringify(envelope, null, pretty ? 2 : 0);
  }

  static parse(value: string): WorkTaskBackupEnvelope {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new RangeError('فایل Backup JSON معتبر نیست.');
    }
    this.validate(parsed);
    return parsed as WorkTaskBackupEnvelope;
  }

  static async restore(
    envelope: WorkTaskBackupEnvelope,
    manager: WorkTaskManager,
    repository?: WorkTaskRepository,
    options: RestoreWorkTaskBackupOptions = {},
  ): Promise<number> {
    this.validate(envelope);
    const replaceManager = options.replaceManager ?? true;
    manager.importRecords(envelope.tasks, replaceManager);

    if (repository) {
      await repository.install?.();
      if (options.replaceRepository ?? true) await repository.clear();
      await repository.upsertMany(envelope.tasks);
    }
    return envelope.tasks.length;
  }

  static validate(value: unknown): asserts value is WorkTaskBackupEnvelope {
    if (!value || typeof value !== 'object') throw new RangeError('ساختار Backup نامعتبر است.');
    const envelope = value as Partial<WorkTaskBackupEnvelope>;
    if (envelope.schemaVersion !== WORK_TASK_BACKUP_SCHEMA_VERSION) {
      throw new RangeError(`نسخه Backup پشتیبانی نمی‌شود: ${String(envelope.schemaVersion)}`);
    }
    if (envelope.engine !== 'webtanan-jalali-date-engine') throw new RangeError('Backup متعلق به Webtanan Jalali Date Engine نیست.');
    if (!Array.isArray(envelope.tasks)) throw new RangeError('لیست Taskهای Backup نامعتبر است.');
    if (envelope.taskCount !== envelope.tasks.length) throw new RangeError('تعداد Taskهای Backup با محتوای فایل هم‌خوان نیست.');
    if (typeof envelope.exportedAt !== 'string' || Number.isNaN(Date.parse(envelope.exportedAt))) {
      throw new RangeError('زمان ایجاد Backup نامعتبر است.');
    }

    // از همان مسیر Validation اصلی Task Manager عبور می‌دهیم؛ داده وارد Manager نمی‌شود چون نمونه موقت است.
    const validator = new WorkTaskManager();
    validator.importRecords(envelope.tasks, true);
  }
}
