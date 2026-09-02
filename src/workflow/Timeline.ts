export interface WorkflowStep {
  title: string;
  date: string;
  completed: boolean;
}

export class WorkflowTimeline {
  private steps: WorkflowStep[] = [];

  addStep(step: WorkflowStep): void {
    this.steps.push(step);
  }

  getSteps(): WorkflowStep[] {
    return this.steps;
  }

  progress(): number {
    if (!this.steps.length) return 0;
    const done = this.steps.filter(step => step.completed).length;
    return Math.round((done / this.steps.length) * 100);
  }
}
