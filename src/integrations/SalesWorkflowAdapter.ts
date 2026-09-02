// Webtanan Jalali Date Engine
// Sales workflow adapter foundation

export type SalesStage = 'order' | 'approval' | 'production' | 'loading' | 'delivery';

export interface SalesStep {
  stage: SalesStage;
  date: string;
  status: 'pending' | 'active' | 'done' | 'failed';
  note?: string;
}

export class SalesWorkflowAdapter {
  private steps: SalesStep[] = [];

  addStep(step: SalesStep) {
    this.steps.push(step);
  }

  getSteps() {
    return this.steps;
  }

  getProgress() {
    if (!this.steps.length) return 0;
    const done = this.steps.filter(s => s.status === 'done').length;
    return Math.round((done / this.steps.length) * 100);
  }
}
