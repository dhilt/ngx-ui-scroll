import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class PreClip {

  static run(scroller: Scroller) {
    scroller.state.process = Process.preClip;

    PreClip.setClipParams(scroller);

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.preClip,
      status: scroller.state.clip.shouldClip ? 'next' : 'done'
    });
  }

  static setClipParams(scroller: Scroller) {
    const { settings, state, buffer, state: { fetch } } = scroller;
    if (!buffer.size) {
      return;
    }
    const firstIndex = <number>fetch.firstIndexBuffer;
    const lastIndex = <number>fetch.lastIndexBuffer;
    if (settings.clipAfterScrollOnly && (state.scroll === false || state.direction === null)) {
      return;
    }
    if (state.direction === Direction.forward || !settings.clipAfterScrollOnly) {
      if (firstIndex - 1 >= buffer.absMinIndex) {
        PreClip.setClipParamsByDirection(scroller, Direction.forward, firstIndex);
      }
    }
    if (state.direction === Direction.backward || !settings.clipAfterScrollOnly) {
      if (lastIndex + 1 <= buffer.absMaxIndex) {
        PreClip.setClipParamsByDirection(scroller, Direction.backward, lastIndex);
      }
    }
  }

  static setClipParamsByDirection(scroller: Scroller, direction: Direction, edgeIndex: number) {
    const { buffer, state: { clip } } = scroller;
    const bufferEdgeIndex = buffer.getIndex(edgeIndex);
    if (bufferEdgeIndex === -1) {
      return;
    }
    const forward = direction === Direction.forward;
    let size = 0;
    buffer.items.forEach((item, index) => {
      if ((forward && item.$index < edgeIndex) || (!forward && item.$index > edgeIndex)) {
        buffer.items[index].toRemove = true;
        size += buffer.items[index].size;
      }
    });
    if (size) {
      clip[forward ? Direction.backward : Direction.forward].size = size;
    }
  }

  static _setClipParams(scroller: Scroller) {
    if (!scroller.buffer.size) {
      return;
    }
    const items = scroller.buffer.items;
    const viewport = scroller.viewport;
    const clip = scroller.state.clip;
    const clipPadding = scroller.buffer.getAveragePackSize();
    const viewportBackwardLimit = viewport.getClipLimit(Direction.backward, clipPadding);
    const viewportForwardLimit = viewport.getClipLimit(Direction.forward, clipPadding);
    const firstIndex = 0;
    const lastIndex = items.length - 1;
    const firstItemEdge = items[firstIndex].getEdge(Direction.backward);
    const lastItemEdge = items[lastIndex].getEdge(Direction.forward);

    // case when all items should be clipped
    const outBackward = lastItemEdge < viewportBackwardLimit;
    const outForward = firstItemEdge > viewportForwardLimit;
    if (outBackward || outForward) {
      items.forEach(item => item.toRemove = true);
      clip[outBackward ? Direction.backward : Direction.forward].size = lastItemEdge - firstItemEdge;
      return;
    }

    let clipBackward = true, clipForward = false;
    for (let i = firstIndex; i <= lastIndex; i++) {
      const item = items[i];
      if (clipBackward && item.getEdge(Direction.forward) <= viewportBackwardLimit) {
        item.toRemove = true;
        clip[Direction.backward].size += item.size;
        continue;
      }
      clipBackward = false;
      if (!clipForward && item.getEdge(Direction.backward) < viewportForwardLimit) {
        continue;
      }
      clipForward = true;
      item.toRemove = true;
      clip[Direction.forward].size += item.size;
    }
  }

}
