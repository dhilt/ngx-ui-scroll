import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class Clip {

  static run(scroller: Scroller) {
    scroller.state.process = Process.clip;

    Clip.runByDirection(Direction.forward, scroller);
    Clip.runByDirection(Direction.backward, scroller);
    Clip.processBuffer(scroller);

    scroller.cycleSubscriptions.push(
      scroller.bindData().subscribe(() => {
        scroller.callWorkflow(<ProcessSubject>{
          process: Process.clip,
          status: 'next'
        });
      })
    );
  }

  static runByDirection(direction: Direction, scroller: Scroller) {
    if (!scroller.state.clip[direction].size) {
      return;
    }
    const opposite = direction === Direction.forward ? Direction.backward : Direction.forward;
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
    scroller.log(`clipped ${clipped.length} items`, clipped);
  }

}
