import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class PreClip {

  static run(scroller: Scroller) {
    const state = scroller.state;
    state.process = Process.preClip;

    state.clip.shouldClip =
      !scroller.settings.infinite &&
      !!scroller.buffer.size &&
      (!scroller.settings.clipAfterScrollOnly || scroller.state.scroll);

    if (state.clip.shouldClip) {
      PreClip.shouldClip(scroller);
    }
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.preClip,
      status: state.clip.shouldClip ? 'next' : 'done'
    });
  }

  static shouldClip(scroller: Scroller) {
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

    clip.shouldClip = !!clip.size;
  }

}
