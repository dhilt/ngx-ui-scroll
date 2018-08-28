import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class Clip {

  static run(scroller: Scroller) {
    scroller.state.process = Process.clip;

    Clip.prepareClip(scroller);
    if (scroller.state.clip) {
      Clip.doClip(scroller);
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.clip,
      status: 'next'
    });
  }

  static prepareClip(scroller: Scroller) {
    const { state, buffer, state: { fetch } } = scroller;
    if (!buffer.size) {
      return;
    }
    const firstIndex = <number>fetch.firstIndexBuffer;
    const lastIndex = <number>fetch.lastIndexBuffer;
    if (state.scroll === false || state.direction === null) {
      return;
    }
    if (state.direction === Direction.forward) {
      if (firstIndex - 1 >= buffer.absMinIndex) {
        Clip.prepareClipByDirection(scroller, Direction.forward, firstIndex);
      }
    }
    if (state.direction === Direction.backward) {
      if (lastIndex + 1 <= buffer.absMaxIndex) {
        Clip.prepareClipByDirection(scroller, Direction.backward, lastIndex);
      }
    }
    return;
  }

  static prepareClipByDirection(scroller: Scroller, direction: Direction, edgeIndex: number) {
    const forward = direction === Direction.forward;
    scroller.buffer.items.forEach(item => {
      if (
        (forward && item.$index < edgeIndex) ||
        (!forward && item.$index > edgeIndex)
      ) {
        item.toRemove = true;
        scroller.state.clip = true;
      }
    });
  }

  static doClip(scroller: Scroller) {
    const clipped: Array<number> = [];
    scroller.logger.stat('Before clip');
    scroller.buffer.items = scroller.buffer.items.filter(item => {
      if (item.toRemove) {
        item.hide();
        clipped.push(item.$index);
        return false;
      }
      return true;
    });
    scroller.logger.log(() => [`clipped ${clipped.length} items`, clipped]);
    scroller.logger.stat('After clip');
  }

}
