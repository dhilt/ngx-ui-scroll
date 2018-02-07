import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';
import { Viewport } from '../classes/viewport';
import { Item } from '../interfaces/item';

export default class ShouldFetch {

  static run(workflow: Workflow) {
    if(workflow.direction !== Direction.backward) {
      ShouldFetch.shouldFetchByDirection(Direction.forward, workflow);
    }
    if(workflow.direction !== Direction.forward) {
      ShouldFetch.shouldFetchByDirection(Direction.backward, workflow);
    }
    return Promise.resolve(workflow);
  }

  static shouldFetchByDirection(direction: Direction, workflow: Workflow) {
    const item = workflow.buffer.getEdgeVisibleItem(direction);
    if (!item) {
      workflow.fetch[direction].shouldFetch = true;
    } else {
      const itemEdge = Viewport.getItemEdge(item.element, direction);
      const viewportLimit = workflow.viewport.getLimit(direction);
      workflow.fetch[direction].shouldFetch =
        (direction === Direction.forward) ? itemEdge < viewportLimit : itemEdge > viewportLimit;
    }
    if (workflow.fetch[direction].shouldFetch) {
      ShouldFetch.setStartIndex(direction, workflow, item);
    }
  }

  static setStartIndex(direction: Direction, workflow: Workflow, item: Item) {
    const itemIndex = item ? item.$index : -1;
    const startIndex = workflow.buffer.startIndex !== null ? workflow.buffer.startIndex : workflow.settings.startIndex;
    workflow.fetch[direction].startIndex = direction === Direction.forward ?
      ((item ? (itemIndex + 1) : startIndex)) :
      ((item ? itemIndex : startIndex) - workflow.settings.bufferSize);
  }

}
