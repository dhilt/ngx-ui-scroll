import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export default class PostRender {

  static run(scroller: Scroller) {
    scroller.state.process = Process.postRender;

    // show fetched items, update cache
    PostRender.processFetchedItems(scroller);

    // calculate backward and forward padding sizes
    if (!PostRender.adjustPaddings(scroller)) {
      scroller.callWorkflow(<ProcessSubject>{
        process: Process.postRender,
        status: 'error',
        payload: 'Can\'t get visible item'
      });
      return;
    }

    // negative size adjustments
    PostRender.adjustScroll(scroller);

    // calculate size before start position
    PostRender.setStartDelta(scroller);

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.postRender,
      status: 'next'
    });
  }

  static processFetchedItems(scroller: Scroller) {
    scroller.logger.stat('Before insert new items');
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
    scroller.logger.stat('After insert new items');
  }

  static adjustPaddings(scroller: Scroller): boolean {
    const { buffer } = scroller;
    const firstItem = buffer.getFirstVisibleItem();
    const lastItem = buffer.getLastVisibleItem();
    if (!firstItem || !lastItem) {
      return false;
    }
    const forwardPadding = scroller.viewport.padding[Direction.forward];
    const backwardPadding = scroller.viewport.padding[Direction.backward];
    const firstIndex = firstItem.$index;
    const lastIndex = lastItem.$index;
    let bwdSize = 0, fwdSize = 0;
    for (let index = buffer.minIndex; index < firstIndex; index++) {
      const item = buffer.cache.get(index);
      bwdSize += item ? item.size : 0;
    }
    for (let index = lastIndex; index < buffer.maxIndex; index++) {
      const item = buffer.cache.get(index);
      fwdSize += item ? item.size : 0;
    }
    forwardPadding.size = fwdSize;
    backwardPadding.size = bwdSize;

    scroller.logger.stat('After paddings adjustments');
    return true;
  }

  static adjustScroll(scroller: Scroller) {
    const { buffer, viewport } = scroller;
    const fetch = scroller.state.fetch;
    const items = fetch.items;
    if (items[0].$index >= fetch.minIndex) {
      return;
    }
    const forwardPadding = viewport.padding[Direction.forward];
    let negativeSize = 0;
    for (let index = items[0].$index; index < fetch.minIndex; index++) {
      negativeSize += buffer.getSizeByIndex(index);
    }
    if (negativeSize > 0) {
      const oldPosition = viewport.scrollPosition;
      const newPosition = oldPosition + negativeSize;
      viewport.scrollPosition = newPosition;
      const positionDiff = newPosition - viewport.scrollPosition;
      if (positionDiff > 0) {
        forwardPadding.size += positionDiff;
        viewport.scrollPosition = newPosition;
      }
      viewport.syntheticScrollPositionBefore = oldPosition;
    } else if (negativeSize < 0) {
      forwardPadding.size -= negativeSize;
      viewport.scrollPosition -= negativeSize;
    }
    scroller.logger.stat('After scroll adjustments');
  }

  static setStartDelta(scroller: Scroller) {
    const { buffer, viewport } = scroller;
    viewport.startDelta = 0;
    for (let index = buffer.minIndex; index < scroller.state.startIndex; index++) {
      const item = buffer.cache.get(index);
      viewport.startDelta += item ? item.size : buffer.averageSize;
    }
  }

}
