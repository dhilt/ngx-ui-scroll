import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';

export default class ShouldFetch {

  static run(workflow: Workflow) {
    ShouldFetch.shouldFetchByDirection(Direction.forward, workflow);
    ShouldFetch.shouldFetchByDirection(Direction.backward, workflow);
    return workflow;
  }

  static shouldFetchByDirection(direction: Direction, workflow: Workflow) {
    const item = workflow.buffer.getEdgeVisibleItem(direction);
    if (!item) {
      workflow.fetch[direction].shouldFetch = true;
      return;
    }
    const viewportParams = workflow.viewport.scrollable.getBoundingClientRect();
    const itemParams = item.element.getBoundingClientRect();

    let viewportEdge, itemEdge, shouldFetch;
    if (direction === Direction.forward) {
      viewportEdge = viewportParams.bottom;
      itemEdge = itemParams.bottom;
      shouldFetch = itemEdge <= viewportEdge;
    } else {
      viewportEdge = viewportParams.top;
      itemEdge = itemParams.top;
      shouldFetch = itemEdge >= viewportEdge;
    }

    workflow.fetch[direction].shouldFetch = shouldFetch;
  }

}
