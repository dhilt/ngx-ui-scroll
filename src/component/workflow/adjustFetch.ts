import { Workflow } from '../workflow';
import { Direction } from '../interfaces/index';

export default class AdjustFetch {

  static run(workflow: Workflow) {
    AdjustFetch.runByDirection(Direction.forward, workflow);
    AdjustFetch.runByDirection(Direction.backward, workflow);
    return workflow;
  }

  static runByDirection(direction: Direction, workflow: Workflow) {
    const items = workflow.fetch[direction].items;
    if (!items) {
      return;
    }
    AdjustFetch.processFetchedItems(items);
    const height = Math.abs(items[0].getEdge(Direction.backward) -
      items[items.length - 1].getEdge(Direction.forward));
    if (direction === Direction.forward) {
      return this.adjustForward(workflow, height);
    } else {
      return this.adjustBackward(workflow, height);
    }
  }

  static processFetchedItems(items) {
    for (let i = items.length - 1; i >= 0; i--) {
      const element = items[i].element.children[0];
      element.style.left = '';
      element.style.position = '';
      items[i].invisible = false;
    }
  }

  static adjustForward(workflow: Workflow, size: number) {
    const paddingForward = workflow.viewport.padding[Direction.forward];
    const _paddingSize = paddingForward.size || 0;
    paddingForward.size = Math.max(_paddingSize - size, 0);
  }

  static adjustBackward(workflow: Workflow, size: number) {
    const viewport = workflow.viewport;
    const _scrollPosition = viewport.scrollPosition;
    const paddingBackward = viewport.padding[Direction.backward];
    const paddingForward = viewport.padding[Direction.forward];

    // need to make "size" pixels in backward direction
    // 1) via paddingTop
    const _paddingSize = paddingBackward.size || 0;
    let paddingSize = Math.max(_paddingSize - size, 0);
    paddingBackward.size = paddingSize;
    const paddingDiff = size - (_paddingSize - paddingSize);
    // 2) via scrollTop
    if (paddingDiff > 0) {
      size = paddingDiff;
      viewport.scrollPosition += size;
      const diff = size - viewport.scrollPosition - _scrollPosition;
      if (diff > 0) {
        paddingSize = paddingForward.size || 0;
        paddingForward.size = paddingSize + diff;
        viewport.scrollPosition += diff;
      }
    }
  }

}
