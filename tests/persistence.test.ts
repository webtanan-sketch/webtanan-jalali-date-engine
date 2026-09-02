import { WebtananDatePicker } from '../src/ui/WebtananDatePicker';
import { MemoryStorageAdapter } from '../src/storage/StorageAdapter';
import { JsonRepository } from '../src/storage/JsonRepository';
import { DatePickerPersistence } from '../src/storage/DatePickerPersistence';

describe('DatePickerPersistence', () => {
  test('تاریخ، زمان، بازه و رویدادها را ذخیره و بازیابی می‌کند', async () => {
    const storage = new MemoryStorageAdapter();
    const repository = new JsonRepository(storage, 'calendar');

    const source = new WebtananDatePicker({ time: true, range: true });
    source.setDate('1405/06/11');
    source.setTime(14, 30);
    source.setRange('1405/06/01', '1405/06/20');
    source.addEvent({ date: '1405/06/11', title: 'جلسه فروش', type: 'meeting' });

    const writer = new DatePickerPersistence(source, repository);
    await writer.save();

    const target = new WebtananDatePicker({ time: true, range: true });
    const reader = new DatePickerPersistence(target, repository);
    expect(await reader.restore()).toBe(true);

    expect(target.getDate()).toBe('1405/06/11');
    expect(target.getFormattedTime()).toBe('14:30');
    expect(target.getRange()).toEqual({ start: '1405/06/01', end: '1405/06/20' });
    expect(target.getEvents('1405/06/11')[0]?.title).toBe('جلسه فروش');
  });

  test('وقتی داده‌ای وجود ندارد restore برابر false است', async () => {
    const repository = new JsonRepository(new MemoryStorageAdapter(), 'missing');
    const persistence = new DatePickerPersistence(new WebtananDatePicker(), repository);
    expect(await persistence.restore()).toBe(false);
  });

  test('schema ناسازگار شناسایی می‌شود', async () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem('calendar', JSON.stringify({ schema: 'old/v0', savedAt: '', data: {} }));
    const repository = new JsonRepository(storage, 'calendar');
    await expect(repository.load()).rejects.toThrow();
  });
});
