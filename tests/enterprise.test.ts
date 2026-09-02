// Enterprise layer tests

import { HolidayEngine } from '../src/enterprise/HolidayEngine';
import { DayStatusEngine } from '../src/enterprise/DayStatusEngine';

const holidays = new HolidayEngine();
holidays.add({date:'1405/01/01', title:'نوروز', type:'official'});

console.assert(holidays.isHoliday('1405/01/01'));

const status = new DayStatusEngine();
status.set('1405/06/11','meeting');

console.assert(status.get('1405/06/11') === 'meeting');
