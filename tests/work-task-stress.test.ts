import { WorkTaskManager } from '../src/work/WorkTaskManager';
import { MemoryWorkTaskRepository } from '../src/storage/MemoryWorkTaskRepository';

describe('Work calendar stress', () => {
  test('handles 5000 tasks and monthly queries within a practical bound', async () => {
    const manager = new WorkTaskManager();
    const start = Date.now();
    for (let index = 0; index < 5000; index += 1) {
      const day = (index % 30) + 1;
      manager.add({
        id: `stress-${index}`,
        date: `1405/06/${String(day).padStart(2, '0')}`,
        title: `کار شماره ${index}`,
        status: index % 9 === 0 ? 'done' : 'todo',
        priority: index % 23 === 0 ? 'urgent' : 'normal',
        assignee: `کاربر-${index % 20}`,
        category: `گروه-${index % 8}`,
      });
    }
    const buildDuration = Date.now() - start;
    expect(manager.query({ from: '1405/06/01', to: '1405/06/30' })).toHaveLength(5000);
    expect(manager.query({ assignee: 'کاربر-3' })).toHaveLength(250);
    expect(manager.getByDate('1405/06/11').length).toBeGreaterThan(100);

    const repository = new MemoryWorkTaskRepository();
    const persistStart = Date.now();
    await repository.upsertMany(manager.toJSON());
    expect(await repository.count({ category: 'گروه-2' })).toBeGreaterThan(600);
    const totalDuration = Date.now() - persistStart + buildDuration;

    // سقف عمداً محافظه‌کارانه است تا روی Runnerهای اشتراکی flaky نشود.
    expect(totalDuration).toBeLessThan(5000);
  });
});
