import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus, ProcessSubject } from '../interfaces/index';

export default class Clip {

  static run(scroller: Scroller) {
    scroller.state.process = Process.clip;

    Clip.prepareClip(scroller);
    if (scroller.state.clip) {
      Clip.doClip(scroller);
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.clip,
      status: ProcessStatus.next
    });
  }

  static prepareClip(scroller: Scroller) {
    const { buffer, state: { fetch, scrollState } } = scroller;
    if (!buffer.size) {
      return;
    }
    const firstIndex = <number>fetch.firstIndexBuffer;
    const lastIndex = <number>fetch.lastIndexBuffer;
    if (scrollState.direction === Direction.forward) {
      if (firstIndex - 1 >= buffer.absMinIndex) {
        Clip.prepareClipByDirection(scroller, Direction.forward, firstIndex);
      }
    }
    if (scrollState.direction === Direction.backward) {
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
        scroller.state.clipCall++;
      }
    });
  }

  static doClip(scroller: Scroller) {
    const { buffer, state, viewport, logger } = scroller;
    const clipped: Array<number> = [];
    let size = 0;
    logger.stat('before clip');
    buffer.items = buffer.items.filter(item => {
      if (item.toRemove) {
        size += item.size;
        item.hide();
        clipped.push(item.$index);
        return false;
      }
      return true;
    });
    if (size) {
      const opposite = state.scrollState.direction === Direction.forward ? Direction.backward : Direction.forward;
      viewport.padding[opposite].size += size;
    }
    logger.log(() => [`clipped ${clipped.length} items`, clipped]);
    logger.stat('after clip');
  }

}
