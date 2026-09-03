import { DateValidator } from '../utils/DateValidator';

export type WorkflowStepStatus = 'pending' | 'active' | 'done' | 'failed';

export interface WorkflowStep {
  id?: string;
  title: string;
  date?: string;
  status: WorkflowStepStatus;
  user?: string;
  description?: string;
  gregorianDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowStepRecord extends WorkflowStep {
  id: string;
  title: string;
  status: WorkflowStepStatus;
  createdAt: string;
  updatedAt: string;
}

const clone = (step: WorkflowStepRecord): WorkflowStepRecord => ({ ...step });

export class WorkflowTimeline {
  private steps: WorkflowStepRecord[] = [];
  private sequence = 0;

  addStep(step: WorkflowStep): WorkflowStepRecord {
    const title = step.title.trim();
    if (!title) throw new Error('عنوان مرحله الزامی است.');

    const id = step.id?.trim() || `workflow-${++this.sequence}`;
    if (this.steps.some((item) => item.id === id)) throw new Error('شناسه مرحله تکراری است.');

    const date = step.date ? DateValidator.assertString(step.date) : undefined;
    const now = step.createdAt ?? new Date().toISOString();
    const record: WorkflowStepRecord = {
      ...step,
      id,
      title,
      date,
      gregorianDate: date ? DateValidator.toGregorianISO(date) : undefined,
      createdAt: now,
      updatedAt: step.updatedAt ?? now,
    };
    this.steps.push(record);
    return clone(record);
  }

  updateStep(id: string, patch: Partial<Omit<WorkflowStep, 'id'>>): WorkflowStepRecord {
    const index = this.steps.findIndex((step) => step.id === id);
    if (index < 0) throw new Error('مرحله Workflow پیدا نشد.');
    const current = this.steps[index];
    const title = patch.title !== undefined ? patch.title.trim() : current.title;
    if (!title) throw new Error('عنوان مرحله الزامی است.');
    const date = patch.date !== undefined
      ? (patch.date ? DateValidator.assertString(patch.date) : undefined)
      : current.date;
    const next: WorkflowStepRecord = {
      ...current,
      ...patch,
      id,
      title,
      date,
      gregorianDate: date ? DateValidator.toGregorianISO(date) : undefined,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.steps[index] = next;
    return clone(next);
  }

  getStep(id: string): WorkflowStepRecord | null {
    const step = this.steps.find((item) => item.id === id);
    return step ? clone(step) : null;
  }

  getSteps(): WorkflowStepRecord[] {
    return this.steps.map(clone);
  }

  getCurrentStep(): WorkflowStepRecord | null {
    const active = this.steps.find((step) => step.status === 'active');
    const current = active ?? this.steps.find((step) => step.status === 'pending') ?? null;
    return current ? clone(current) : null;
  }

  getProgress(): number {
    if (!this.steps.length) return 0;
    const done = this.steps.filter((step) => step.status === 'done').length;
    return Math.round((done / this.steps.length) * 100);
  }

  hasFailure(): boolean {
    return this.steps.some((step) => step.status === 'failed');
  }

  isCompleted(): boolean {
    return this.steps.length > 0 && this.steps.every((step) => step.status === 'done');
  }

  removeStep(id: string): boolean {
    const index = this.steps.findIndex((step) => step.id === id);
    if (index < 0) return false;
    this.steps.splice(index, 1);
    return true;
  }

  clear(): void {
    this.steps = [];
  }

  toJSON(): WorkflowStepRecord[] {
    return this.getSteps();
  }
}
