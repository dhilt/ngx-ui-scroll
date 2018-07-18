import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';
import { Item } from '../classes/item';

export default class PostRender {

  static run(scroller: Scroller) {
    scroller.state.process = Process.postRender;

    const viewport = scroller.viewport;
    const direction = scroller.state.direction;
    const items = scroller.state.fetch.items;
    const position = viewport.scrollPosition;
    const fetch = scroller.state.fetch;

    PostRender.processFetchedItems(scroller, items);

    // calculate bwd size
    const startItem = scroller.buffer.get(scroller.state.startIndex);
    const startItemEdge = startItem ? viewport.getElementEdge(startItem.element, Direction.backward) : 0;
    const vpEdge = viewport.getEdge(Direction.backward);
    const bwdSize = startItemEdge - vpEdge;

    // pre-adjustment, scroll position only
    if (position !== viewport.scrollPosition) {
      viewport.scrollPosition = position;
    }

    // paddings and scroll position adjustments
    const totalSize = Math.round(
      Math.abs(items[0].getEdge(Direction.backward) - items[items.length - 1].getEdge(Direction.forward))
    );
    const fwdSize = totalSize - bwdSize;
    PostRender.runForward(scroller, fwdSize);
    const syntheticScrollPosition = PostRender.runBackward(scroller, bwdSize);

    // post-adjustment, scroll position only
    if (position !== viewport.scrollPosition) {
      if (syntheticScrollPosition !== null) {
        viewport.scrollPosition += viewport.scrollPosition - syntheticScrollPosition;
      } else {
        viewport.scrollPosition = position;
      }
      // update startDelta in accordance with artificial scrollPosition change
      viewport.startDelta += viewport.scrollPosition - position;
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.postRender,
      status: 'next'
    });
  }

  static processFetchedItems(scroller: Scroller, items: Array<Item>) {
    const limit = items.length - 1;
    for (let i = 0; i <= limit; i++) {
      const element = items[i].element;
      element.style.left = '';
      element.style.position = '';
      items[i].invisible = false;
      items[i].setSize();
      // scroller.buffer.cache.add(items[i]);
    }
    scroller.buffer.cache.addList(items, scroller.state.isInitial ? scroller.state.startIndex : null);
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
      return viewport.scrollPosition;
    }
    return null;
  }

}
