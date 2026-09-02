import { CalendarEventBridge } from '../src/integrations/CalendarEventBridge';
import { CRMAdapter } from '../src/integrations/CRMAdapter';

describe('Integration layer', () => {
  test('CalendarEventBridge رویدادها را بر اساس تاریخ فیلتر می‌کند', () => {
    const bridge = new CalendarEventBridge();
    bridge.add({ date: '1405/06/11', title: 'جلسه فروش' });
    bridge.add({ date: '1405/06/11', title: 'پیگیری پرداخت' });
    bridge.add({ date: '1405/06/12', title: 'تحویل سفارش' });

    expect(bridge.getByDate('1405/06/11')).toHaveLength(2);
    expect(bridge.getByDate('1405/06/12')).toEqual([
      { date: '1405/06/12', title: 'تحویل سفارش' },
    ]);

    bridge.clear();
    expect(bridge.getByDate('1405/06/11')).toEqual([]);
  });

  test('CRMAdapter فقط Timeline مشتری خواسته‌شده را برمی‌گرداند', () => {
    const crm = new CRMAdapter();
    crm.addFollowUp({ customer: 'رضا احمدی', date: '1405/06/10', title: 'تماس', type: 'call' });
    crm.addFollowUp({ customer: 'رضا احمدی', date: '1405/06/15', title: 'پیگیری قیمت', type: 'followup' });
    crm.addFollowUp({ customer: 'مریم رضایی', date: '1405/06/12', title: 'جلسه', type: 'meeting' });

    expect(crm.getCustomerTimeline('رضا احمدی')).toEqual([
      { customer: 'رضا احمدی', date: '1405/06/10', title: 'تماس', type: 'call' },
      { customer: 'رضا احمدی', date: '1405/06/15', title: 'پیگیری قیمت', type: 'followup' },
    ]);
    expect(crm.getCustomerTimeline('مشتری ناشناس')).toEqual([]);
  });
});
