export interface WorkflowStep {
  title: string;
  date?: string;
  status: 'pending' | 'active' | 'done' | 'failed';
  user?: string;
}

export class WorkflowTimeline {
  private steps: WorkflowStep[] = [];

  addStep(step: WorkflowStep): void {
    this.steps.push(step);
  }

  getSteps(): WorkflowStep[] {
    return this.steps;
  }

  getProgress(): number {
    if (!this.steps.length) return 0;
    const done = this.steps.filter(s => s.status === 'done').length;
    return Math.round((done / this.steps.length) * 100);
  }
}
