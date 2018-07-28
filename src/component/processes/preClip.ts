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
    const viewportBackwardLimit = viewport.getLimit(Direction.backward);
    const viewportForwardLimit = viewport.getLimit(Direction.forward);
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
      if (clipBackward && item.getEdge(Direction.forward) < viewportBackwardLimit) {
        item.toRemove = true;
        clip[Direction.backward].size += item.size;
        continue;
      }
      clipBackward = false;
      if (!clipForward && item.getEdge(Direction.backward) <= viewportForwardLimit) {
        continue;
      }
      clipForward = true;
      item.toRemove = true;
      clip[Direction.forward].size += item.size;
    }

    clip.shouldClip = !!clip.size;
  }

  static shouldClipByDirection(direction: Direction, scroller: Scroller) {
    const items = scroller.buffer.items;
    const forward = direction === Direction.forward;
    const viewport = scroller.viewport;
    const viewportLimit = viewport.getLimit(direction, true);
    const firstIndex = scroller.buffer.getFirstVisibleItemIndex();
    const lastIndex = scroller.buffer.getLastVisibleItemIndex();
    const firstItemEdge = items[firstIndex].getEdge(direction);
    const lastItemEdge = items[lastIndex].getEdge(direction);

    let i, itemEdge, start = -1, end = -1;
    const getItemEdge = (index: number) =>
      index === firstIndex ? firstItemEdge : (
        index === lastIndex ? lastItemEdge :
          items[index].getEdge(direction));

    if ((forward && lastItemEdge <= viewportLimit) || (!forward && firstItemEdge >= viewportLimit)) {
      // all items should be clipped
      start = firstIndex;
      end = lastIndex;
    } else {
      if (forward) {
        start = firstIndex;
      } else {
        end = lastIndex;
      }
      for (
        forward ? (i = 0) : (i = lastIndex);
        forward ? (i <= lastIndex) : (i >= 0);
        forward ? i++ : i--
      ) {
        itemEdge = getItemEdge(i);
        if (forward && itemEdge <= viewportLimit) {
          end = i;
        } else if (!forward && itemEdge >= viewportLimit) {
          start = i;
        } else {
          break;
        }
      }
    }

    if (start >= 0 && end >= 0) {
      let itemsToRemove = 0;
      for (i = start; i <= end; i++) {
        items[i].toRemove = true;
        itemsToRemove++;
      }
      scroller.state.clip[direction].shouldClip = true;
      scroller.state.clip[direction].size = items[end].getEdge(Direction.forward) - items[start].getEdge(Direction.backward);
      scroller.state.clip[direction].items = itemsToRemove;
    }
  }

}
