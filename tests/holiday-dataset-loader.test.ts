import { HolidayDatasetLoader } from '../src/enterprise/holidays/HolidayDatasetLoader';
import { IRAN_OFFICIAL_HOLIDAYS_1405 } from '../src/enterprise/holidays/IranOfficialHolidayDatasets';

describe('HolidayDatasetLoader', () => {
  test('payload معتبر را به AnnualHolidayDataset تبدیل می‌کند', () => {
    const loader = new HolidayDatasetLoader(null);
    const dataset = loader.fromPayload(IRAN_OFFICIAL_HOLIDAYS_1405, 1405);

    expect(dataset.year).toBe(1405);
    expect(dataset.getHolidays(1405)).toHaveLength(26);
  });

  test('عدم تطابق سال مورد انتظار رد می‌شود', () => {
    const loader = new HolidayDatasetLoader(null);
    expect(() => loader.fromPayload(IRAN_OFFICIAL_HOLIDAYS_1405, 1406)).toThrow('مورد انتظار');
  });

  test('JSON سالانه قابل بارگذاری است', () => {
    const loader = new HolidayDatasetLoader(null);
    const dataset = loader.fromJson(JSON.stringify(IRAN_OFFICIAL_HOLIDAYS_1405), 1405);
    expect(dataset.getHolidays(1405)[0]?.date).toBe('1405/01/01');
  });

  test('URL با fetch تزریقی بارگذاری می‌شود', async () => {
    const loader = new HolidayDatasetLoader(async () => ({
      ok: true,
      status: 200,
      async json() {
        return IRAN_OFFICIAL_HOLIDAYS_1405;
      },
    }));

    const dataset = await loader.fromUrl('https://example.test/holidays-1405.json', 1405);
    expect(dataset.source.title).toContain('۱۴۰۵');
  });

  test('خطای HTTP صریح گزارش می‌شود', async () => {
    const loader = new HolidayDatasetLoader(async () => ({
      ok: false,
      status: 503,
      async json() { return {}; },
    }));

    await expect(loader.fromUrl('https://example.test/holidays.json')).rejects.toThrow('HTTP 503');
  });
});
