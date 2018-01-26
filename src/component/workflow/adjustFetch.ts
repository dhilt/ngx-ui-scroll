import { Workflow } from '../workflow';
import { Direction } from '../models/index';

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
    const height = Math.abs(items[0].element.getBoundingClientRect().top -
      items[items.length - 1].element.getBoundingClientRect().bottom);
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

  static adjustForward(workflow: Workflow, height: number) {
    const paddingForward = workflow.viewport.paddingForward;
    const _paddingHeight = parseInt(paddingForward.style.height, 10) || 0;
    const paddingHeight = Math.max(_paddingHeight - height, 0);
    paddingForward.style.height = paddingHeight + 'px';
  }

  static adjustBackward(workflow: Workflow, height: number) {
    const viewport = workflow.viewport;
    const _scrollPosition = viewport.scrollPosition;
    const paddingBackward = viewport.paddingBackward;
    const paddingForward = viewport.paddingForward;

    // now need to make "height" pixels top
    // 1) via paddingTop
    const _paddingHeight = parseInt(paddingBackward.style.height, 10) || 0;
    let paddingHeight = Math.max(_paddingHeight - height, 0);
    paddingBackward.style.height = paddingHeight + 'px';
    const paddingDiff = height - (_paddingHeight - paddingHeight);
    // 2) via scrollTop
    if (paddingDiff > 0) {
      height = paddingDiff;
      viewport.scrollPosition += height;
      const diff = height - viewport.scrollPosition - _scrollPosition;
      if (diff > 0) {
        paddingHeight = parseInt(paddingForward.style.height, 10) || 0;
        paddingForward.style.height = (paddingHeight + diff) + 'px';
        viewport.scrollPosition += diff;
      }
    }
  }

}
