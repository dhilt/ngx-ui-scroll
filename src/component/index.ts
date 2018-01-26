import { Workflow } from './workflow';
import { debouncedRound } from './utils/index';
import { WorkflowRunner } from './runner';

let onScrollListener: Function;
let workflow;

export function initialize(context) {

  workflow = new Workflow(context);

  const scrollHandler = (event) => {
    if (!workflow.disabledScroll) {
      debouncedRound(() => WorkflowRunner.run(workflow), 25);
    } else {
      // setTimeout(() => {
      workflow.disabledScroll = false;
      // });
    }
  };

  onScrollListener = context.renderer.listen(workflow.viewport.scrollable, 'scroll', scrollHandler);

  workflow.buffer.$items.subscribe(items => context.items = items);

  workflow.resolver.subscribe(
    (result) => {
      console.log('---=== WF2-result', result);
      WorkflowRunner.run(workflow);
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
