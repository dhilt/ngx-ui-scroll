import { Workflow } from './workflow';
import { debouncedRound } from './utils/index';
import { WorkflowRunner } from './runner';

let onScrollListener: Function;
let workflow;

export function initialize(context) {

  workflow = new Workflow(context);

  const scrollHandler = () => {
    if (!workflow.disabledScroll) {
      debouncedRound(() => WorkflowRunner.run(workflow), 25);
      //WorkflowRunner.run(workflow);
    } else {
      // setTimeout(() => {
      workflow.disabledScroll = false;
      // });
    }
  };

  onScrollListener = context.renderer.listen(workflow.viewport.scrollable, 'scroll', scrollHandler);

  workflow.buffer.$items.subscribe(items => context.items = items);

  workflow.resolver.subscribe(
    (next) => {
      if(next) {
        WorkflowRunner.run(workflow);
      }
    },
    (error) => {
      throw error;
    }
  );

  WorkflowRunner.run(workflow);
}

export function dispose(context) {
  onScrollListener();
  workflow.dispose();
}
