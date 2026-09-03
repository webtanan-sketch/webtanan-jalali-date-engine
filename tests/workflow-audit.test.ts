import { SalesWorkflowAdapter } from '../src/integrations/SalesWorkflowAdapter';
import { ProductionWorkflowAdapter } from '../src/integrations/ProductionWorkflowAdapter';
import { CalendarEventBridge } from '../src/integrations/CalendarEventBridge';
import { DateValidator } from '../src/utils/DateValidator';

describe('Workflow audit & date validation', () => {
  test('DateValidator ورودی فارسی را نرمال و مقایسه می‌کند', () => {
    expect(DateValidator.normalize('۱۴۰۵/۶/۱۱')).toBe('1405/06/11');
    expect(DateValidator.compare('1405/06/10', '1405/06/11')).toBe(-1);
    expect(DateValidator.normalize('1404/12/30')).toBeNull();
  });

  test('گردش فروش تاریخ میلادی و Audit metadata می‌سازد', () => {
    const sales = new SalesWorkflowAdapter();
    const step = sales.addStep({
      stage: 'order',
      date: '۱۴۰۵/۶/۱۱',
      status: 'done',
      responsible: 'کارشناس فروش',
      createdAt: '2026-09-03T11:00:00.000Z',
    });

    expect(step.date).toBe('1405/06/11');
    expect(step.gregorianDate).toBe('2026-09-02');
    expect(step.createdAt).toBe('2026-09-03T11:00:00.000Z');
    expect(() => sales.addStep({ stage: 'order', date: '1405/06/12', status: 'pending' })).toThrow('قبلاً');
  });

  test('گردش فروش تأخیر را تا قبل از تحویل تشخیص می‌دهد', () => {
    const sales = new SalesWorkflowAdapter();
    sales.addStep({ stage: 'order', date: '1405/06/01', status: 'done' });
    sales.addStep({ stage: 'delivery', date: '1405/06/20', status: 'pending' });
    expect(sales.isDelayed('1405/06/20', '1405/06/21')).toBe(true);
    sales.updateStep('delivery', { status: 'done' });
    expect(sales.isDelayed('1405/06/20', '1405/06/21')).toBe(false);
  });

  test('سفارش تولید تاریخ‌های شروع و تحویل را نرمال می‌کند', () => {
    const production = new ProductionWorkflowAdapter();
    const order = production.createOrder({
      id: 'P-300',
      product: 'کاشی استخری',
      quantity: 120,
      startDate: '۱۴۰۵/۶/۱',
      dueDate: '1405/06/20',
      createdAt: '2026-09-03T12:00:00.000Z',
    });

    expect(order.startDate).toBe('1405/06/01');
    expect(order.startGregorianDate).toBe('2026-08-23');
    expect(order.dueGregorianDate).toBe('2026-09-11');
    expect(order.createdAt).toBe('2026-09-03T12:00:00.000Z');
  });

  test('تاریخ مرحله تولید معادل میلادی می‌گیرد و ورودی نامعتبر رد می‌شود', () => {
    const production = new ProductionWorkflowAdapter();
    production.createOrder({ id: 'P-301', product: 'محصول' });
    const order = production.updateStage('P-301', 'production', {
      status: 'active',
      date: '1405/06/11',
      responsible: 'سرپرست تولید',
    });
    const stage = order.stages.find((item) => item.key === 'production');
    expect(stage?.gregorianDate).toBe('2026-09-02');
    expect(() => production.updateStage('P-301', 'quality', { date: '1404/12/30' })).toThrow('نامعتبر');
  });

  test('CalendarEventBridge بدون any و با تاریخ معتبر کار می‌کند', () => {
    const bridge = new CalendarEventBridge<{ date: string; title: string; code: number }>();
    bridge.add({ date: '۱۴۰۵/۶/۱۱', title: 'جلسه', code: 10 });
    expect(bridge.getByDate('1405/06/11')).toEqual([
      { date: '1405/06/11', title: 'جلسه', code: 10 },
    ]);
    expect(bridge.remove((event) => event.code === 10)).toBe(1);
    expect(bridge.list()).toEqual([]);
  });
});
