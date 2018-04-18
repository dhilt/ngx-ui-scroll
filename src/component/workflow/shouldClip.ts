import { Scroller } from '../scroller';
import { Direction } from '../interfaces/index';

export default class ShouldClip {

  static run(scroller: Scroller) {
    const fetchOnly = scroller.settings.clipAfterFetchOnly;
    const scrollOnly = scroller.settings.clipAfterScrollOnly;
    if (!scroller.buffer.size) {
      return scroller;
    }
    if (scrollOnly && !scroller.state.scroll) {
      return scroller;
    }
    if (!fetchOnly || scroller.state.fetch[Direction.backward].shouldFetch) {
      ShouldClip.shouldClipByDirection(Direction.backward, scroller);
    }
    if (!fetchOnly || scroller.state.fetch[Direction.forward].shouldFetch) {
      ShouldClip.shouldClipByDirection(Direction.forward, scroller);
    }
    return scroller;
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
    const getItemEdge = (index) =>
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
