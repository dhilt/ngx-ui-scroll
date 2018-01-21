import { Workflow } from './workflow';
import { Data } from './data';
import { Elements } from './elements';
import { debouncedRound } from './utils';

let onScrollListener: Function;

export function initialize() {
  // -    Elements.initialize(this.elementRef);
  // -    Data.initialize(this);
  // -    Workflow.initialize(this);
  // -    this.onScrollListener = this.renderer.listen(Elements.viewport, 'scroll', (event) =>
  // -      debouncedRound(() => Workflow.run(event), 25)
  // -    );
  // -    Workflow.run(Direction.bottom);
  // -    Workflow.run(Direction.top);

  const elements = new Elements(this.elementRef);
  const data = new Data(this.datasource, this);
  const workflow = new Workflow(elements, data);

  onScrollListener = this.renderer.listen(elements.viewport, 'scroll', (event) =>
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

export function dispose() {
  onScrollListener();
}
