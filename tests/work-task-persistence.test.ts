import { MemoryWorkTaskRepository } from '../src/storage/MemoryWorkTaskRepository';
import { WorkTaskPersistence } from '../src/storage/WorkTaskPersistence';
import { WorkTaskManager } from '../src/work/WorkTaskManager';

describe('WorkTaskPersistence', () => {
  test('add, update, load, toggle and remove stay in sync', async () => {
    const repository = new MemoryWorkTaskRepository();
    const manager = new WorkTaskManager();
    const persistence = new WorkTaskPersistence(manager, repository);

    const task = await persistence.add({ id: 'p1', date: '1405/06/11', title: 'پیگیری', assignee: 'رضا' });
    expect((await repository.get('p1'))?.title).toBe('پیگیری');

    await persistence.update(task.id, { title: 'پیگیری قیمت', priority: 'high' });
    expect(manager.get('p1')?.title).toBe('پیگیری قیمت');
    expect((await repository.get('p1'))?.priority).toBe('high');

    await persistence.toggleDone('p1');
    expect((await repository.get('p1'))?.status).toBe('done');

    const secondManager = new WorkTaskManager();
    const secondPersistence = new WorkTaskPersistence(secondManager, repository);
    const loaded = await secondPersistence.load();
    expect(loaded).toHaveLength(1);
    expect(secondManager.get('p1')?.status).toBe('done');

    expect(await secondPersistence.remove('p1')).toBe(true);
    expect(secondManager.get('p1')).toBeNull();
    expect(await repository.get('p1')).toBeNull();
  });

  test('failed repository update rolls manager back', async () => {
    class FailingRepository extends MemoryWorkTaskRepository {
      fail = false;
      override async upsert(task: Parameters<MemoryWorkTaskRepository['upsert']>[0]): Promise<void> {
        if (this.fail) throw new Error('database offline');
        await super.upsert(task);
      }
    }

    const repository = new FailingRepository();
    const manager = new WorkTaskManager();
    const persistence = new WorkTaskPersistence(manager, repository);
    await persistence.add({ id: 'p2', date: '1405/06/12', title: 'نسخه اصلی' });
    repository.fail = true;

    await expect(persistence.update('p2', { title: 'نسخه خراب' })).rejects.toThrow('database offline');
    expect(manager.get('p2')?.title).toBe('نسخه اصلی');
  });
});
