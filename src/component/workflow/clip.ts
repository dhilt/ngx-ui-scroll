import { Workflow } from '../workflow';
import { Direction } from '../interfaces/direction';

export default class Clip {

  static run(workflow: Workflow) {
    if (!workflow.clip.shouldClip) {
      return workflow;
    }
    Clip.runByDirection(Direction.forward, workflow);
    Clip.runByDirection(Direction.backward, workflow);
    Clip.processBuffer(workflow);
    workflow.bindData();
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        Clip.processClip(workflow);
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

  static processBuffer(workflow: Workflow) {
    workflow.buffer.items = workflow.buffer.items.filter(item => {
      if (item.toRemove) {
        workflow.buffer.cache.add(item);
        item.hide();
        return false;
      }
      return true;
    });
    if (!workflow.buffer.size) {
      workflow.clip.previous.set(workflow.direction);
    }
  }

  static processClip(workflow: Workflow) {
    if (!workflow.clip[Direction.backward].shouldClip) {
      workflow.buffer.bof = false;
    }
    if (!workflow.clip[Direction.forward].shouldClip) {
      workflow.buffer.eof = false;
    }
  }

}
