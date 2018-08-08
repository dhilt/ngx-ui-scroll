import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class PostRender {

  static run(scroller: Scroller) {
    scroller.state.process = Process.postRender;

    const { viewport, buffer } = scroller;
    const items = buffer.items;
    const fetch = scroller.state.fetch;
    const forwardPadding = scroller.viewport.padding[Direction.forward];
    const backwardPadding = scroller.viewport.padding[Direction.backward];
    const position = viewport.scrollPosition;

    scroller.stat('Before unhide');
    PostRender.processFetchedItems(scroller);
    scroller.stat('After unhide');

    // calculate backward and forward padding sizes
    let bwdSize = 0, fwdSize = 0;
    const firstIndex = items[0].$index;
    const lastIndex = items[items.length - 1].$index;
    for (let index = buffer.minIndex; index < firstIndex; index++) {
      const item = buffer.cache.get(index);
      bwdSize += item ? item.size : 0;
    }
    for (let index = lastIndex; index < buffer.maxIndex; index++) {
      const item = buffer.cache.get(index);
      fwdSize += item ? item.size : 0;
    }

    // calculate size before start position
    viewport.startDelta = 0;
    for (let index = buffer.minIndex; index < scroller.state.startIndex; index++) {
      const item = buffer.cache.get(index);
      viewport.startDelta += item ? item.size : buffer.averageSize;
    }

    // set paddings
    forwardPadding.size = fwdSize;
    const bwdPaddingDiff = bwdSize - backwardPadding.size;
    backwardPadding.size = bwdSize;
    if (bwdPaddingDiff > 0) {
      viewport.scrollPosition += bwdPaddingDiff;
    }
    scroller.stat('After set paddings');

    // backward items adjustments
    const bwdItemsSize = fetch.backwardItems.reduce((acc, i) => {
      const item = fetch.items.find(_item => _item.$index === i);
      return acc + (item ? item.size : 0);
    }, 0);
    if (bwdItemsSize > 0) {
      const newScrollPosition = viewport.scrollPosition + bwdItemsSize;
      viewport.scrollPosition = newScrollPosition;
      const diff = newScrollPosition - viewport.scrollPosition;
      if (diff) {
        forwardPadding.size += diff;
        viewport.scrollPosition = newScrollPosition;
      }
      scroller.stat('Backward items adjustments');
    }

    scroller.stat('After adjustments');

    // if (position !== viewport.scrollPosition) {
    //   viewport.scrollPosition = position;
    // }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.postRender,
      status: 'next'
    });
  }

  static processFetchedItems(scroller: Scroller) {
    const items = scroller.state.fetch.items;
    const limit = items.length - 1;
    for (let i = 0; i <= limit; i++) {
      const element = items[i].element;
      element.style.left = '';
      element.style.position = '';
      items[i].invisible = false;
      items[i].setSize();
      scroller.buffer.cache.add(items[i]);
    }
    // scroller.buffer.cache.addList(items, scroller.state.isInitial ? scroller.state.startIndex : null);
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
