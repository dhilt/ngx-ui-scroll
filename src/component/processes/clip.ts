import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class Clip {

  static run(scroller: Scroller) {
    scroller.state.process = Process.clip;

    scroller.logger.stat('Before clip');
    Clip.runByDirection(Direction.forward, scroller);
    Clip.runByDirection(Direction.backward, scroller);
    Clip.processBuffer(scroller);
    scroller.logger.stat('After clip');

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.clip,
      status: 'next'
    });
  }

  static runByDirection(direction: Direction, scroller: Scroller) {
    if (!scroller.state.clip[direction].size) {
      return;
    }
    scroller.viewport.padding[direction].size += scroller.state.clip[direction].size;
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
