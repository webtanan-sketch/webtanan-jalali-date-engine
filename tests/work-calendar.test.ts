import { createWorkTask, updateWorkTask } from '../src/work/WorkTask';
import { WorkTaskManager } from '../src/work/WorkTaskManager';

describe('Big Work Calendar task engine', () => {
  test('creates a normalized task with Gregorian mirror date', () => {
    const task = createWorkTask({
      id: 'T-1',
      date: '1405/6/11',
      title: ' تماس با مشتری ',
      time: '9:05',
      priority: 'high',
      tags: ['فروش', 'فروش', 'پیگیری'],
    }, new Date('2026-09-03T10:00:00.000Z'));

    expect(task.dateJalali).toBe('1405/06/11');
    expect(task.dateGregorian).toBe('2026-09-02');
    expect(task.time).toBe('09:05');
    expect(task.title).toBe('تماس با مشتری');
    expect(task.tags).toEqual(['فروش', 'پیگیری']);
  });

  test('rejects invalid date and reversed time range', () => {
    expect(() => createWorkTask({ date: '1404/12/30', title: 'نامعتبر' })).toThrow(RangeError);
    expect(() => createWorkTask({ date: '1405/06/11', title: 'جلسه', time: '14:00', endTime: '12:00' })).toThrow(RangeError);
  });

  test('manager supports day lists, search, overdue and toggle done', () => {
    const manager = new WorkTaskManager();
    const first = manager.add({ id: '1', date: '1405/06/10', title: 'پیگیری قیمت', assignee: 'رضا', category: 'فروش', time: '10:00' });
    manager.add({ id: '2', date: '1405/06/10', title: 'جلسه تولید', assignee: 'علی', category: 'تولید', time: '08:00' });
    manager.add({ id: '3', date: '1405/06/12', title: 'تحویل سفارش', status: 'done' });

    expect(manager.getByDate('1405/06/10').map((item) => item.id)).toEqual(['2', '1']);
    expect(manager.query({ search: 'قیمت' })).toHaveLength(1);
    expect(manager.query({ category: 'تولید' })).toHaveLength(1);
    expect(manager.getOverdue('1405/06/11').map((item) => item.id)).toEqual(['2', '1']);

    manager.toggleDone(first.id);
    expect(manager.get(first.id)?.status).toBe('done');
    expect(manager.getOverdue('1405/06/11').map((item) => item.id)).toEqual(['2']);
  });

  test('update preserves creation timestamp and sets completed timestamp', () => {
    const task = createWorkTask({ id: 'x', date: '1405/06/11', title: 'کار' }, new Date('2026-09-03T08:00:00.000Z'));
    const updated = updateWorkTask(task, { status: 'done' }, new Date('2026-09-03T09:00:00.000Z'));
    expect(updated.createdAt).toBe('2026-09-03T08:00:00.000Z');
    expect(updated.updatedAt).toBe('2026-09-03T09:00:00.000Z');
    expect(updated.completedAt).toBe('2026-09-03T09:00:00.000Z');
  });
});
