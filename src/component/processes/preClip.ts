import { getBaseProcess } from './_base';
import { Scroller } from '../scroller';
import { Direction, CommonProcess, ProcessStatus } from '../interfaces/index';

export default class PreClip extends getBaseProcess(CommonProcess.preClip) {

  static run(scroller: Scroller) {
    PreClip.prepareClip(scroller);

    scroller.workflow.call({
      process: PreClip.process,
      status: ProcessStatus.next,
      payload: {
        doClip: scroller.state.clip.doClip
      }
    });
  }

  static prepareClip(scroller: Scroller) {
    const { state: { fetch, clip } } = scroller;
    if (PreClip.shouldNotClip(scroller)) {
      return;
    }
    const firstIndex = fetch.first.indexBuffer;
    const lastIndex = fetch.last.indexBuffer;
    scroller.logger.log(() =>
      `looking for ${fetch.direction ? 'anti-' + fetch.direction + ' ' : ''}items ` +
      `that are out of [${firstIndex}..${lastIndex}] range`);
    if (PreClip.isBackward(scroller, firstIndex)) {
      PreClip.prepareClipByDirection(scroller, Direction.backward, firstIndex);
    }
    if (PreClip.isForward(scroller, lastIndex)) {
      PreClip.prepareClipByDirection(scroller, Direction.forward, lastIndex);
    }
    if (!clip.doClip) {
      scroller.logger.log(`skipping clip [no items to clip]`);
    }
    return;
  }

  static shouldNotClip(scroller: Scroller): boolean {
    const { settings, buffer, state } = scroller;
    if (settings.infinite) {
      scroller.logger.log(`skipping clip [infinite mode]`);
      return true;
    }
    if (!buffer.size) {
      scroller.logger.log(`skipping clip [empty buffer]`);
      return true;
    }
    if (state.cycle.isInitial) {
      scroller.logger.log(`skipping clip [initial cycle]`);
      return true;
    }
    return false;
  }

  static isBackward(scroller: Scroller, firstIndex: number): boolean {
    const { buffer, state: { clip, fetch } } = scroller;
    if (clip.force) {
      return clip.forceBackward;
    }
    if (fetch.direction !== Direction.backward) {
      if (firstIndex - 1 >= buffer.absMinIndex) {
        return true;
      }
    }
    return false;
  }

  static isForward(scroller: Scroller, lastIndex: number): boolean {
    const { buffer, state: { clip, fetch } } = scroller;
    if (clip.force) {
      return clip.forceForward;
    }
    if (fetch.direction !== Direction.forward) {
      if (lastIndex + 1 <= buffer.absMaxIndex) {
        return true;
      }
    }
    return false;
  }

  static prepareClipByDirection(scroller: Scroller, direction: Direction, edgeIndex: number) {
    const forward = direction === Direction.forward;
    scroller.buffer.items.forEach(item => {
      if (
        (!forward && item.$index < edgeIndex) ||
        (forward && item.$index > edgeIndex)
      ) {
        item.toRemove = true;
        item.removeDirection = direction;
        scroller.state.clip.doClip = true;
      }
    });
  }

}
