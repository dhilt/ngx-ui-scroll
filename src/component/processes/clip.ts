import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class Clip {

  static run(scroller: Scroller) {
    scroller.state.process = Process.clip;

    scroller.logger.stat('Before clip');
    Clip.adjustPadding(scroller, Direction.forward);
    Clip.adjustPadding(scroller, Direction.backward);
    Clip.processBuffer(scroller);
    scroller.logger.stat('After clip');

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.clip,
      status: 'done'
    });
  }

  static adjustPadding(scroller: Scroller, direction: Direction) {
    const clip = scroller.state.clip[direction];
    if (!clip.shouldClip) {
      return;
    }
    scroller.viewport.padding[direction].size += clip.size;
  }

  static processBuffer(scroller: Scroller) {
    const clipped: Array<number> = [];
    scroller.buffer.items = scroller.buffer.items.filter(item => {
      if (item.toRemove) {
        item.hide();
        clipped.push(item.$index);
        return false;
      }
      return true;
    });
    scroller.logger.log(() => [`clipped ${clipped.length} items`, clipped]);
  }

}
