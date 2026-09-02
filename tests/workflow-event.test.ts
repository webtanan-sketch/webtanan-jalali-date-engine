import { EventEngine } from '../src/enterprise/EventEngine';
import { WorkflowTimeline } from '../src/enterprise/WorkflowTimeline';

describe('Enterprise Calendar', () => {
  test('event registration', () => {
    const engine = new EventEngine();
    engine.add({id:'1', date:'1405/06/10', title:'تماس مشتری', type:'call'});
    expect(engine.getByDate('1405/06/10').length).toBe(1);
  });

  test('workflow progress', () => {
    const flow = new WorkflowTimeline();
    flow.addStep({title:'ثبت سفارش', status:'done'});
    flow.addStep({title:'تحویل', status:'pending'});
    expect(flow.getProgress()).toBe(50);
  });
});
