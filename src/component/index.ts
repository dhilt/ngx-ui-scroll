import { Workflow } from './workflow';
import { debouncedRound } from './utils/index';
import { WorkflowRunner } from './runner';

let onScrollListener: Function;
let workflow;

export function initialize(context) {

  workflow = new Workflow(context);

  onScrollListener = context.renderer.listen(workflow.viewport.element, 'scroll', (event) =>
    debouncedRound(() => WorkflowRunner.run(workflow), 25)
  );

  workflow.buffer.$items.subscribe(items => context.items = items);

  workflow.resolver.subscribe(
    (result) => {
      console.log('---=== WF2-result', result);
    },
    (error) => {
      console.log('---=== WF2-error', error);
    }
  );

  WorkflowRunner.run(workflow);
}

export function dispose(context) {
  onScrollListener();
  workflow.dispose();
}
