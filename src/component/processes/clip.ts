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
        Clip.processClip(scroller);
        scroller.process$.next(<ProcessSubject>{
          process: Process.clip
        });
      })
    );
  }

  static runByDirection(direction: Direction, scroller: Scroller) {
    if (!scroller.state.clip[direction].shouldClip) {
      return;
    }
    const opposite = direction === Direction.forward ? Direction.backward : Direction.forward;
    scroller.viewport.padding[opposite].size += scroller.state.clip[direction].size;
  }

  static processBuffer(scroller: Scroller) {
    scroller.buffer.items = scroller.buffer.items.filter(item => {
      if (item.toRemove) {
        scroller.buffer.cache.add(item);
        item.hide();
        return false;
      }
      return true;
    });
    if (!scroller.buffer.size) {
      scroller.state.setPreviousClip();
    }
  }

  static processClip(scroller: Scroller) {
    if (!scroller.state.clip[Direction.backward].shouldClip) {
      scroller.buffer.bof = false;
    }
    if (!scroller.state.clip[Direction.forward].shouldClip) {
      scroller.buffer.eof = false;
    }
  }

}
