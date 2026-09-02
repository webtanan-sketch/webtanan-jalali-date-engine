import { ProductionWorkflowAdapter } from '../src/integrations/ProductionWorkflowAdapter';

describe('ProductionWorkflowAdapter', () => {
  test('محاسبه پیشرفت و تشخیص تأخیر', () => {
    const engine = new ProductionWorkflowAdapter();
    engine.createOrder({ id: 'P-100', product: 'کاشی استخری', dueDate: '1405/06/20' });

    engine.updateStage('P-100', 'planning', { status: 'done', date: '1405/06/01' });
    engine.updateStage('P-100', 'materials', { status: 'done', date: '1405/06/02' });
    engine.updateStage('P-100', 'production', { status: 'done', date: '1405/06/05' });

    expect(engine.getProgress('P-100')).toBe(43);
    expect(engine.isDelayed('P-100', '1405/06/21')).toBe(true);
  });

  test('جلوگیری از ثبت شناسه تکراری', () => {
    const engine = new ProductionWorkflowAdapter();
    engine.createOrder({ id: 'P-200', product: 'محصول آزمایشی' });
    expect(() => engine.createOrder({ id: 'P-200', product: 'تکراری' })).toThrow();
  });
});
