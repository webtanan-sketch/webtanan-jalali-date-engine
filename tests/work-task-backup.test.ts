import { MemoryWorkTaskRepository } from '../src/storage/MemoryWorkTaskRepository';
import { WorkTaskBackup, WORK_TASK_BACKUP_SCHEMA_VERSION } from '../src/storage/WorkTaskBackup';
import { WorkTaskManager } from '../src/work/WorkTaskManager';

describe('WorkTaskBackup', () => {
  test('creates, serializes, parses and restores a versioned backup', async () => {
    const source = new WorkTaskManager();
    source.add({ id: 'b1', date: '1405/06/11', title: 'کار اول', tags: ['فروش'] });
    source.add({ id: 'b2', date: '1405/06/12', title: 'کار دوم', status: 'done' });

    const backup = WorkTaskBackup.create(source, { project: 'crm' }, new Date('2026-09-03T12:00:00.000Z'));
    expect(backup.schemaVersion).toBe(WORK_TASK_BACKUP_SCHEMA_VERSION);
    expect(backup.taskCount).toBe(2);
    expect(backup.metadata?.project).toBe('crm');

    const parsed = WorkTaskBackup.parse(WorkTaskBackup.stringify(backup));
    const target = new WorkTaskManager();
    const repository = new MemoryWorkTaskRepository();
    expect(await WorkTaskBackup.restore(parsed, target, repository)).toBe(2);
    expect(target.get('b1')?.title).toBe('کار اول');
    expect((await repository.get('b2'))?.status).toBe('done');
  });

  test('rejects unsupported schema and corrupted taskCount', () => {
    expect(() => WorkTaskBackup.parse('{"schemaVersion":2,"engine":"webtanan-jalali-date-engine","exportedAt":"2026-09-03T12:00:00.000Z","taskCount":0,"tasks":[]}')).toThrow(RangeError);
    expect(() => WorkTaskBackup.parse('{"schemaVersion":1,"engine":"webtanan-jalali-date-engine","exportedAt":"2026-09-03T12:00:00.000Z","taskCount":2,"tasks":[]}')).toThrow(RangeError);
  });
});
