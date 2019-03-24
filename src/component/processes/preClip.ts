import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus } from '../interfaces/index';

export default class PreClip {

  static run(scroller: Scroller) {
    PreClip.prepareClip(scroller);

    scroller.callWorkflow({
      process: Process.preClip,
      status: ProcessStatus.next,
      payload: { doClip: scroller.state.doClip }
    });
  }

  static prepareClip(scroller: Scroller) {
    const { buffer, state, state: { fetch, fetch: { direction } } } = scroller;
    if (!buffer.size) {
      return;
    }
    if (state.isInitialWorkflowCycle && !state.scrollState.scroll) {
      scroller.logger.log(`skipping clip [initial cycle, no scroll]`);
      return;
    }
    const firstIndex = <number>fetch.firstIndexBuffer;
    const lastIndex = <number>fetch.lastIndexBuffer;
    scroller.logger.log(() =>
      `looking for ${direction ? 'anti-' + direction + ' ' : ''}items ` +
      `that are out of [${firstIndex}..${lastIndex}] range`);
    if (!direction || direction === Direction.forward) {
      if (firstIndex - 1 >= buffer.absMinIndex) {
        PreClip.prepareClipByDirection(scroller, Direction.forward, firstIndex);
      }
    }
    if (!direction || direction === Direction.backward) {
      if (lastIndex + 1 <= buffer.absMaxIndex) {
        PreClip.prepareClipByDirection(scroller, Direction.backward, lastIndex);
      }
    }
    if (!scroller.state.doClip) {
      scroller.logger.log(`skipping clip [no items to clip]`);
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
        scroller.state.doClip = true;
      }
    });
  }

}
