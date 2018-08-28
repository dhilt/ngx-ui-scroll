import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class Clip {

  static run(scroller: Scroller) {
    scroller.state.process = Process.clip;

    if (Clip.setClipParams(scroller)) {
      Clip.doClip(scroller);
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.clip,
      status: 'next'
    });
  }

  static setClipParams(scroller: Scroller): boolean {
    const { settings, state, buffer, state: { fetch } } = scroller;
    if (!buffer.size) {
      return false;
    }
    const firstIndex = <number>fetch.firstIndexBuffer;
    const lastIndex = <number>fetch.lastIndexBuffer;
    if (settings.clipAfterScrollOnly && (state.scroll === false || state.direction === null)) {
      return false;
    }
    let result = false;
    if (state.direction === Direction.forward || !settings.clipAfterScrollOnly) {
      if (firstIndex - 1 >= buffer.absMinIndex) {
        result = result || Clip.setClipParamsByDirection(scroller, Direction.forward, firstIndex);
      }
    }
    if (state.direction === Direction.backward || !settings.clipAfterScrollOnly) {
      if (lastIndex + 1 <= buffer.absMaxIndex) {
        result = result || Clip.setClipParamsByDirection(scroller, Direction.backward, lastIndex);
      }
    }
    return result;
  }

  static setClipParamsByDirection(scroller: Scroller, direction: Direction, edgeIndex: number): boolean {
    const forward = direction === Direction.forward;
    let result = false;
    scroller.buffer.items.forEach(item => {
      if (
        (forward && item.$index < edgeIndex) ||
        (!forward && item.$index > edgeIndex)
      ) {
        item.toRemove = true;
        result = true;
      }
    });
    return result;
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
