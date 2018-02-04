import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';
import { Viewport } from '../classes/viewport';

export default class ShouldFetch {

  static run(workflow: Workflow) {
    if(workflow.direction !== Direction.backward) {
      ShouldFetch.shouldFetchByDirection(Direction.forward, workflow);
    }
    if(workflow.direction !== Direction.forward) {
      ShouldFetch.shouldFetchByDirection(Direction.backward, workflow);
    }
    return workflow;
  }

  static shouldFetchByDirection(direction: Direction, workflow: Workflow) {
    const item = workflow.buffer.getEdgeVisibleItem(direction);
    if (!item) {
      workflow.fetch[direction].shouldFetch = true;
    } else {
      const viewportEdge = workflow.viewport.getEdge(direction);
      const itemEdge = Viewport.getItemEdge(item.element, direction);
      workflow.fetch[direction].shouldFetch =
        (direction === Direction.forward) ? itemEdge <= viewportEdge : itemEdge >= viewportEdge;
    }
    if (workflow.fetch[direction].shouldFetch) {
      ShouldFetch.setStartIndex(direction, workflow);
    }
  }

  static setStartIndex(direction: Direction, workflow: Workflow) {
    const settings = workflow.settings;
    const edgeItem = workflow.buffer.getEdgeVisibleItem(direction);
    const edgeIndex = edgeItem ? edgeItem.$index : -1;
    workflow.fetch[direction].startIndex = direction === Direction.forward ?
      ((edgeItem ? (edgeIndex + 1) : settings.startIndex)) :
      ((edgeItem ? edgeIndex : settings.startIndex) - settings.bufferSize);
  }

}
