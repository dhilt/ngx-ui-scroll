import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class PreClip {

  static run(scroller: Scroller) {
    scroller.state.process = Process.preClip;

    let shouldNotClip =
      scroller.settings.infinite ||
      !scroller.buffer.size ||
      (scroller.settings.clipAfterScrollOnly && !scroller.state.scroll);

    if (!shouldNotClip) {
      const afterFetch = scroller.settings.clipAfterFetchOnly;
      if (!afterFetch || scroller.state.fetch.shouldFetch) {
        PreClip.shouldClipByDirection(Direction.backward, scroller);
        PreClip.shouldClipByDirection(Direction.forward, scroller);
      }
      shouldNotClip = !scroller.state.clip.shouldClip;
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.preClip,
      status: !shouldNotClip ? 'next' : 'done'
    });
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
