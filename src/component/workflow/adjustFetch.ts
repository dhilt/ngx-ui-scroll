import { Workflow } from '../workflow';
import { Direction } from '../models/index';

export default class AdjustFetch {

  static run(workflow: Workflow) {
    AdjustFetch.runByDirection(Direction.forward, workflow);
    AdjustFetch.runByDirection(Direction.backward, workflow);
    return workflow;
  }

  static runByDirection(direction: Direction, workflow: Workflow) {
    const items = workflow.fetch[Direction.forward].items;
    if (!items) {
      return;
    }
    const height = Math.abs(items[0].element.getBoundingClientRect().top -
      items[items.length - 1].element.getBoundingClientRect().bottom);
    if (direction === Direction.forward) {
      return this.adjustForward(workflow, height);
    } else {
      return this.adjustBackward(workflow, height);
    }
  }

  static adjustForward(workflow: Workflow, height: number) {
    const paddingForward = workflow.viewport.paddingForward;
    const _paddingHeight = parseInt(paddingForward.style.height, 10) || 0;
    const paddingHeight = Math.max(_paddingHeight - height, 0);
    paddingForward.style.height = paddingHeight + 'px';
  }

  static adjustBackward(workflow: Workflow, height: number) {
    const viewport = workflow.viewport.element;
    const _scrollTop = viewport.scrollTop;
    const paddingBackward = workflow.viewport.paddingBackward;
    const paddingForward = workflow.viewport.paddingForward;

    // now need to make "height" pixels top
    // 1) via paddingTop
    const _paddingHeight = parseInt(paddingBackward.style.height, 10) || 0;
    const paddingHeight = Math.max(_paddingHeight - height, 0);
    paddingBackward.style.height = paddingHeight + 'px';
    const paddingDiff = height - (_paddingHeight - paddingHeight);
    // 2) via scrollTop
    if (paddingDiff > 0) {
      height = paddingDiff;
      workflow.viewport.changeScrollPosition(height);
      const diff = height - viewport.scrollTop - _scrollTop;
      if (diff > 0) {
        const paddingHeight = parseInt(paddingForward.style.height, 10) || 0;
        paddingForward.style.height = (paddingHeight + diff) + 'px';
        workflow.viewport.changeScrollPosition(diff);
      }
    }
  }

}
