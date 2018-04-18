import { Scroller } from '../scroller';
import { Direction } from '../interfaces/index';

export default class AdjustFetch {

  static run(scroller: Scroller) {
    const direction = scroller.direction;
    const items = scroller.fetch[direction].items;
    if (!items) {
      return;
    }
    // scroller.stat('start adjust');
    AdjustFetch.processFetchedItems(items);
    const height = Math.round(
      Math.abs(items[0].getEdge(Direction.backward) - items[items.length - 1].getEdge(Direction.forward))
    );
    if (direction === Direction.forward) {
      AdjustFetch.runForward(scroller, height);
    } else {
      AdjustFetch.runBackward(scroller, height);
    }
    // scroller.stat('end adjust');
    return scroller;
  }

  static processFetchedItems(items) {
    for (let i = items.length - 1; i >= 0; i--) {
      const element = items[i].element;
      element.style.left = '';
      element.style.position = '';
      items[i].invisible = false;
    }
  }

  static runForward(scroller: Scroller, size: number) {
    const paddingForward = scroller.viewport.padding[Direction.forward];
    const _paddingSize = paddingForward.size || 0;
    paddingForward.size = Math.max(_paddingSize - size, 0);
  }

  static runBackward(scroller: Scroller, size: number) {
    const viewport = scroller.viewport;
    const _scrollPosition = viewport.scrollPosition;
    const paddingBackward = viewport.padding[Direction.backward];
    const paddingForward = viewport.padding[Direction.forward];

    // need to make "size" pixels in backward direction
    // 1) via paddingTop
    const _paddingSize = paddingBackward.size || 0;
    let paddingSize = Math.max(_paddingSize - size, 0);
    paddingBackward.size = paddingSize;
    const paddingDiff = size - (_paddingSize - paddingSize);
    // 2) via scrollTop
    if (paddingDiff > 0) {
      size = paddingDiff;
      viewport.scrollPosition += size;
      const diff = size - viewport.scrollPosition - _scrollPosition;
      if (diff > 0) {
        paddingSize = paddingForward.size || 0;
        paddingForward.size = paddingSize + diff;
        viewport.scrollPosition += diff;
      }
      viewport.syntheticScrollPosition = viewport.scrollPosition;
    }
  }

}
