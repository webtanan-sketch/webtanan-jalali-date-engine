import * as API from '../src/index';

const requiredFunctionsAndClasses = [
  'JalaliCore',
  'JalaliConverter',
  'JalaliYearEngine',
  'getJalaliYearInfo',
  'JalaliCalendar',
  'CalendarRenderer',
  'TimeSelector',
  'WebtananDatePicker',
  'BigWorkCalendar',
  'WorkTaskManager',
  'createWorkTask',
  'ThemeManager',
  'HolidayEngine',
  'HolidayDatasetLoader',
  'getIranOfficialHolidayDataset',
  'DayStatusEngine',
  'BusinessDayCalculator',
  'EventEngine',
  'CRMAdapter',
  'AccountingCalendarAdapter',
  'SalesWorkflowAdapter',
  'ProductionWorkflowAdapter',
  'MemoryStorageAdapter',
  'BrowserStorageAdapter',
  'DatabaseStorageAdapter',
  'RestStorageAdapter',
  'JsonRepository',
  'DatePickerPersistence',
  'MemoryWorkTaskRepository',
  'IndexedDbWorkTaskRepository',
  'SqlWorkTaskRepository',
  'BetterSqlite3Executor',
  'Mysql2Executor',
  'WorkTaskPersistence',
  'WebtananJalaliDatePickerElement',
  'defineWebtananJalaliDatePicker',
] as const;

describe('Public API contract', () => {
  test.each(requiredFunctionsAndClasses)('%s از API عمومی صادر می‌شود', (name) => {
    expect(API[name]).toBeDefined();
  });

  test('محدوده الگوریتم و نمونه‌های کبیسه در API عمومی ثابت هستند', () => {
    expect(API.JalaliConverter.supportedYears).toEqual({ min: 1, max: 3177 });
    expect(API.JalaliYearEngine.isLeap(1360)).toBe(false);
    expect(API.JalaliYearEngine.isLeap(1358)).toBe(true);
  });

  test('دیتاست‌های داخلی ۱۴۰۴ و ۱۴۰۵ از API عمومی قابل دریافت‌اند', () => {
    expect(API.IRAN_OFFICIAL_DATASET_YEARS).toEqual([1404, 1405]);
    expect(API.getIranOfficialHolidayDataset(1404)).not.toBeNull();
    expect(API.getIranOfficialHolidayDataset(1405)).not.toBeNull();
  });

  test('چهار Theme حرفه‌ای در قرارداد عمومی هستند', () => {
    expect(API.ThemeManager.list().map((theme) => theme.name)).toEqual([
      'industrial-light',
      'navy-command',
      'steel-neutral',
      'graphite-dark',
    ]);
  });
});
