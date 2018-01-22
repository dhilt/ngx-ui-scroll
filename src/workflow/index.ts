import { Workflow } from './workflow';
import { Data } from './data';
import { Elements } from './elements';
import { debouncedRound } from './utils/index';

let onScrollListener: Function;

export function initialize(context) {
  // -    Elements.initialize(context.elementRef);
  // -    Data.initialize(context);
  // -    Workflow.initialize(context);
  // -    context.onScrollListener = context.renderer.listen(Elements.viewport, 'scroll', (event) =>
  // -      debouncedRound(() => Workflow.run(event), 25)
  // -    );
  // -    Workflow.run(Direction.bottom);
  // -    Workflow.run(Direction.top);

  const elements = new Elements(context.elementRef);
  const data = new Data(context.datasource, context);
  const workflow = new Workflow(elements, data);

  onScrollListener = context.renderer.listen(elements.viewport, 'scroll', (event) =>
    debouncedRound(() => Workflow.run(event), 25)
  );

  workflow.resolver.subscribe(
    (result) => {
      console.log('---=== WF2-result', result);
    },
    (error) => {
      console.log('---=== WF2-error', error);
    }
  );
  Workflow.run(workflow);
}

export function dispose(context) {
  onScrollListener();
}
