import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus } from '../interfaces/index';

export default class Clip {

  static run(scroller: Scroller) {
    Clip.prepareClip(scroller);
    if (scroller.state.clip) {
      Clip.doClip(scroller);
    }

    scroller.callWorkflow({
      process: Process.clip,
      status: ProcessStatus.next
    });
  }

  static prepareClip(scroller: Scroller) {
    const { buffer, state: { fetch, fetch: { direction } } } = scroller;
    if (!buffer.size) {
      return;
    }
    const firstIndex = <number>fetch.firstIndexBuffer;
    const lastIndex = <number>fetch.lastIndexBuffer;
    scroller.logger.log(() =>
      `looking for ${direction ? 'anti-' + direction + ' ' : ''}items ` +
      `that are out of [${firstIndex}..${lastIndex}] range`);
    if (!direction || direction === Direction.forward) {
      if (firstIndex - 1 >= buffer.absMinIndex) {
        Clip.prepareClipByDirection(scroller, Direction.forward, firstIndex);
      }
    }
    if (!direction || direction === Direction.backward) {
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
        item.removeDirection = direction;
        scroller.state.clip = true;
      }
    });
  }

  static doClip(scroller: Scroller) {
    const { buffer, viewport: { padding }, logger } = scroller;
    const clipped: Array<number> = [];
    const size = { backward: 0, forward: 0 };
    scroller.state.clipCall++;
    logger.stat(`before clip (${scroller.state.clipCall})`);
    buffer.items = buffer.items.filter(item => {
      if (item.toRemove) {
        size[item.removeDirection] += item.size;
        item.hide();
        clipped.push(item.$index);
        return false;
      }
      return true;
    });
    if (size.backward) {
      padding.backward.size += size.backward;
    }
    if (size.forward) {
      padding.forward.size += size.forward;
    }
    logger.log(() => [
      `clipped ${clipped.length} items` +
      (size.backward ? `, +${size.backward} bwd px` : '') +
      (size.forward ? `, +${size.forward} fwd px` : ''),
      clipped
    ]);
    logger.stat('after clip');
  }

}
