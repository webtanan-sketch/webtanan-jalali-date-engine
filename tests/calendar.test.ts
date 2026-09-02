import { InteractiveCalendar } from '../src/calendar/InteractiveCalendar';

test('انتخاب تاریخ باید درست ذخیره شود', () => {
  const calendar = new InteractiveCalendar();
  expect(calendar.select('1405/06/11')).toBe('1405/06/11');
});
