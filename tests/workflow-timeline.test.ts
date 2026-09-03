import { WorkflowTimeline } from '../src/enterprise/WorkflowTimeline';

describe('WorkflowTimeline enterprise', () => {
  test('مرحله دارای تاریخ، معادل میلادی و Audit metadata می‌شود', () => {
    const flow = new WorkflowTimeline();
    const step = flow.addStep({
      id: 'approval',
      title: 'تأیید سفارش',
      date: '۱۴۰۵/۶/۱۱',
      status: 'active',
      user: 'مدیر فروش',
      createdAt: '2026-09-03T12:00:00.000Z',
    });
    expect(step.date).toBe('1405/06/11');
    expect(step.gregorianDate).toBe('2026-09-02');
    expect(step.createdAt).toBe('2026-09-03T12:00:00.000Z');
    expect(flow.getCurrentStep()?.id).toBe('approval');
  });

  test('پیشرفت، تکمیل و شکست محاسبه می‌شوند', () => {
    const flow = new WorkflowTimeline();
    flow.addStep({ title: 'مرحله ۱', status: 'done' });
    const second = flow.addStep({ title: 'مرحله ۲', status: 'pending' });
    expect(flow.getProgress()).toBe(50);
    expect(flow.isCompleted()).toBe(false);
    flow.updateStep(second.id, { status: 'failed' });
    expect(flow.hasFailure()).toBe(true);
  });

  test('بعد از تکمیل همه مراحل درصد ۱۰۰ و completed=true است', () => {
    const flow = new WorkflowTimeline();
    const first = flow.addStep({ title: 'مرحله ۱', status: 'pending' });
    const second = flow.addStep({ title: 'مرحله ۲', status: 'pending' });
    flow.updateStep(first.id, { status: 'done' });
    flow.updateStep(second.id, { status: 'done' });
    expect(flow.getProgress()).toBe(100);
    expect(flow.isCompleted()).toBe(true);
    expect(flow.getCurrentStep()).toBeNull();
  });

  test('تاریخ نامعتبر رد و شناسه تکراری جلوگیری می‌شود', () => {
    const flow = new WorkflowTimeline();
    flow.addStep({ id: 'x', title: 'مرحله', status: 'pending' });
    expect(() => flow.addStep({ id: 'x', title: 'دوباره', status: 'pending' })).toThrow('تکراری');
    expect(() => flow.addStep({ title: 'نامعتبر', date: '1404/12/30', status: 'pending' })).toThrow('نامعتبر');
  });

  test('حذف مرحله و خروجی clone شده کار می‌کند', () => {
    const flow = new WorkflowTimeline();
    const step = flow.addStep({ title: 'مرحله', status: 'pending' });
    const copy = flow.getSteps();
    copy[0].title = 'دستکاری بیرونی';
    expect(flow.getStep(step.id)?.title).toBe('مرحله');
    expect(flow.removeStep(step.id)).toBe(true);
    expect(flow.getSteps()).toEqual([]);
  });
});
