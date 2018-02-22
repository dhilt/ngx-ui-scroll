import { Workflow } from '../workflow';
import { Direction } from '../interfaces/direction';

export default class Clip {

  static run(workflow: Workflow) {
    if (!workflow.clip.shouldClip) {
      return workflow;
    }
    Clip.runByDirection(Direction.forward, workflow);
    Clip.runByDirection(Direction.backward, workflow);

    workflow.buffer.items = workflow.buffer.items.filter(item => {
      if (item.toRemove) {
        item.hide();
        return false;
      }
      return true;
    });
    workflow.bindData();
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        resolve(workflow);
      })
    );
  }

  static runByDirection(direction: Direction, workflow: Workflow) {
    if (!workflow.clip[direction].shouldClip) {
      return;
    }
    const opposite = direction === Direction.forward ? Direction.backward : Direction.forward;
    workflow.viewport.padding[opposite].size += workflow.clip[direction].size;
  }

}
