// Sales workflow tests

import { SalesWorkflowAdapter } from '../src/integrations/SalesWorkflowAdapter';

test('sales workflow progress', () => {
  const workflow = new SalesWorkflowAdapter();
  workflow.addStep({stage:'order',date:'1405/06/01',status:'done'});
  workflow.addStep({stage:'delivery',date:'1405/06/10',status:'pending'});

  expect(workflow.getProgress()).toBe(50);
});
