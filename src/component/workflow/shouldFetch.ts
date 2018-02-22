import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';

export default class ShouldFetch {

  static run(workflow: Workflow) {
    if (workflow.direction !== Direction.backward) {
      ShouldFetch.shouldFetchByDirection(Direction.forward, workflow);
    }
    if (workflow.direction !== Direction.forward) {
      ShouldFetch.shouldFetchByDirection(Direction.backward, workflow);
    }
    return Promise.resolve(workflow);
  }

  static shouldFetchByDirection(direction: Direction, workflow: Workflow) {
    const item = workflow.buffer.getEdgeVisibleItem(direction);
    if (!item) {
      workflow.fetch[direction].shouldFetch = true;
    } else {
      const itemEdge = item.getEdge(direction);
      const viewportLimit = workflow.viewport.getLimit(direction);
      workflow.fetch[direction].shouldFetch =
        (direction === Direction.forward) ? itemEdge < viewportLimit : itemEdge > viewportLimit;
    }
    if (workflow.fetch[direction].shouldFetch) {
      ShouldFetch.setStartIndex(direction, workflow);
    }
  }

  static setStartIndex(direction: Direction, workflow: Workflow) {
    const forward = direction === Direction.forward;
    const back = -workflow.settings.bufferSize;
    let start;
    if (workflow.buffer.lastIndex[direction] === null) {
      start = workflow.settings.startIndex + (forward ? 0 : back);
    } else {
      start = workflow.buffer.lastIndex[direction] + (forward ? 1 : back);
    }
    workflow.fetch[direction].startIndex = start;
  }

}
