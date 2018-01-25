import { Workflow } from '../workflow';
import { Direction } from '../models/index';

export default class AdjustFetch {

  static run(workflow: Workflow) {
    this.adjustByDirection(Direction.forward, workflow);
    this.adjustByDirection(Direction.backward, workflow);
  }

  static adjustByDirection(direction: Direction, workflow: Workflow) {
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
    
  }

  static adjustBackward(workflow: Workflow, height: number) {

  }

}
