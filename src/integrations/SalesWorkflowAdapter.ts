import { DateValidator } from '../utils/DateValidator';

export type SalesStage = 'order' | 'approval' | 'production' | 'loading' | 'delivery';
export type SalesStepStatus = 'pending' | 'active' | 'done' | 'failed';

export interface SalesStep {
  stage: SalesStage;
  date: string;
  status: SalesStepStatus;
  note?: string;
  responsible?: string;
  gregorianDate?: string;
  createdAt?: string;
}

export interface SalesStepRecord extends SalesStep {
  date: string;
  gregorianDate: string;
  createdAt: string;
}

const STAGE_ORDER: SalesStage[] = ['order', 'approval', 'production', 'loading', 'delivery'];

export class SalesWorkflowAdapter {
  private steps = new Map<SalesStage, SalesStepRecord>();

  addStep(step: SalesStep): SalesStepRecord {
    if (this.steps.has(step.stage)) throw new Error('این مرحله فروش قبلاً ثبت شده است.');
    const date = DateValidator.assertString(step.date);
    const record: SalesStepRecord = {
      ...step,
      date,
      gregorianDate: DateValidator.toGregorianISO(date),
      createdAt: step.createdAt ?? new Date().toISOString(),
    };
    this.steps.set(step.stage, record);
    return { ...record };
  }

  updateStep(stage: SalesStage, patch: Partial<Omit<SalesStep, 'stage'>>): SalesStepRecord {
    const current = this.steps.get(stage);
    if (!current) throw new Error('مرحله فروش پیدا نشد.');
    const date = patch.date !== undefined ? DateValidator.assertString(patch.date) : current.date;
    const next: SalesStepRecord = {
      ...current,
      ...patch,
      stage,
      date,
      gregorianDate: DateValidator.toGregorianISO(date),
      createdAt: current.createdAt,
    };
    this.steps.set(stage, next);
    return { ...next };
  }

  getSteps(): SalesStepRecord[] {
    return STAGE_ORDER
      .map((stage) => this.steps.get(stage))
      .filter((step): step is SalesStepRecord => Boolean(step))
      .map((step) => ({ ...step }));
  }

  getCurrentStage(): SalesStepRecord | null {
    const steps = this.getSteps();
    const active = steps.find((step) => step.status === 'active');
    if (active) return active;
    return steps.find((step) => step.status === 'pending') ?? null;
  }

  getProgress(): number {
    if (!this.steps.size) return 0;
    const done = [...this.steps.values()].filter((step) => step.status === 'done').length;
    return Math.round((done / this.steps.size) * 100);
  }

  isDelayed(dueDate: string, today: string): boolean {
    const due = DateValidator.assertString(dueDate);
    const current = DateValidator.assertString(today);
    const delivered = this.steps.get('delivery')?.status === 'done';
    return !delivered && current > due;
  }

  toJSON(): SalesStepRecord[] {
    return this.getSteps();
  }

  clear(): void {
    this.steps.clear();
  }
}
