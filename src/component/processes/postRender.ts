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
    const firstItem = buffer.getFirstVisibleItem();
    const position = viewport.scrollPosition;
    const posDiff = position - fetch.position;
    scroller.log('scr pos diff:', posDiff, ', fetch pos:', fetch.position);

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

    // set paddings
    forwardPadding.size = fwdSize;
    const bwdPaddingDiff = bwdSize - backwardPadding.size;
    backwardPadding.size = bwdSize;
    scroller.stat('After set paddings');

    // negative size adjustments
    if (fetch.negativeSize) {
      const newItemsSize = buffer.items.reduce((acc, item) => (acc += item.size) && acc, 0);
      const negativeSize = newItemsSize - fetch.positiveSize;
      if (negativeSize > 0) {
        const oldPosition = viewport.scrollPosition;
        const newPosition = oldPosition + negativeSize;
        viewport.scrollPosition = newPosition;
        const positionDiff = newPosition - viewport.scrollPosition;
        if (positionDiff > 0) {
          forwardPadding.size += positionDiff;
          viewport.scrollPosition = newPosition;
        }
      }
    }

    scroller.stat('After adjustments');
    scroller.settings.debug = false;

    // calculate size before start position
    viewport.startDelta = 0;
    for (let index = buffer.minIndex; index < scroller.state.startIndex; index++) {
      const item = buffer.cache.get(index);
      viewport.startDelta += item ? item.size : buffer.averageSize;
    }

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

}
