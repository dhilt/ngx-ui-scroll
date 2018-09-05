import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus, ProcessSubject } from '../interfaces/index';

export default class Adjust {

  static MAX_SCROLL_ADJUSTMENTS_COUNT = 10;

  static run(scroller: Scroller) {
    scroller.state.process = Process.adjust;

    const setPaddingsResult =
      Adjust.setPaddings(scroller);

    if (setPaddingsResult === false) {
      scroller.callWorkflow(<ProcessSubject>{
        process: Process.adjust,
        status: ProcessStatus.error,
        payload: 'Can\'t get visible item'
      });
      return;
    }

    Adjust.fixNegativeScroll(scroller, <number>setPaddingsResult);

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.adjust,
      status: ProcessStatus.done
    });
  }

  static setPaddings(scroller: Scroller): boolean | number {
    const { viewport, buffer, state: { fetch } } = scroller;
    const firstItem = buffer.getFirstVisibleItem();
    const lastItem = buffer.getLastVisibleItem();
    if (!firstItem || !lastItem) {
      return false;
    }
    scroller.state.preAdjustPosition = viewport.scrollPosition;
    const forwardPadding = viewport.padding[Direction.forward];
    const backwardPadding = viewport.padding[Direction.backward];
    const firstIndex = firstItem.$index;
    const lastIndex = lastItem.$index;
    const minIndex = isFinite(buffer.absMinIndex) ? buffer.absMinIndex : buffer.minIndex;
    const maxIndex = isFinite(buffer.absMaxIndex) ? buffer.absMaxIndex : buffer.maxIndex;
    const averageItemSizeDiff = buffer.averageSize - fetch.averageItemSize;
    let index, bwdSize = 0, fwdSize = 0, bwdPaddingAverageSizeItemsCount = 0;

    // new backward padding
    for (index = minIndex; index < firstIndex; index++) {
      const item = buffer.cache.get(index);
      bwdSize += item ? item.size : buffer.cache.averageSize;
      if (averageItemSizeDiff) {
        bwdPaddingAverageSizeItemsCount += !item ? 1 : 0;
      }
    }
    if (averageItemSizeDiff) {
      for (index = firstIndex; index < <number>fetch.firstIndexBuffer; index++) {
        bwdPaddingAverageSizeItemsCount += !buffer.cache.get(index) ? 1 : 0;
      }
    }

    // new forward padding
    for (index = lastIndex + 1; index <= maxIndex; index++) {
      const item = buffer.cache.get(index);
      fwdSize += item ? item.size : buffer.cache.averageSize;
    }

    forwardPadding.size = fwdSize;
    backwardPadding.size = bwdSize;

    scroller.logger.stat('After paddings adjustments');
    return bwdPaddingAverageSizeItemsCount;
  }

  static fixNegativeScroll(scroller: Scroller, bwdPaddingAverageSizeItemsCount: number) {
    const { viewport, buffer, state, state: { fetch, fetch: { negativeSize } } } = scroller;
    const oldPosition = state.preAdjustPosition;

    // if backward padding has been changed due to average item size change
    const averageItemSizeDiff = buffer.averageSize - fetch.averageItemSize;
    const bwdDiff = averageItemSizeDiff ? averageItemSizeDiff * state.bwdPaddingAverageSizeItemsCount -
      (state.bwdPaddingAverageSizeItemsCount - bwdPaddingAverageSizeItemsCount) * buffer.averageSize : 0;
    const positionDiff = oldPosition - viewport.scrollPosition + bwdDiff;
    if (positionDiff !== 0) {
      Adjust.setScroll(scroller, positionDiff);
      scroller.logger.stat('After scroll position adjustment (average)');
    }
    state.bwdPaddingAverageSizeItemsCount = bwdPaddingAverageSizeItemsCount;

    if (scroller.state.sizeBeforeRender === scroller.viewport.getScrollableSize()) {
      return;
    }

    // negative items case
    const items = fetch.items;
    if (items[0].$index >= fetch.minIndex) {
      return;
    }
    const forwardPadding = viewport.padding[Direction.forward];
    if (negativeSize > 0) {
      Adjust.setScroll(scroller, negativeSize);
    } else if (negativeSize < 0) {
      forwardPadding.size -= negativeSize;
      viewport.scrollPosition -= negativeSize;
    }
    scroller.logger.stat('After scroll position adjustment (negative)');
  }

  static setScroll(scroller: Scroller, delta: number) {
    const { viewport } = scroller;
    const forwardPadding = viewport.padding[Direction.forward];
    const oldPosition = viewport.scrollPosition;
    const newPosition = oldPosition + delta;
    for (let i = 0; i < Adjust.MAX_SCROLL_ADJUSTMENTS_COUNT; i++) {
      viewport.scrollPosition = newPosition;
      const positionDiff = newPosition - viewport.scrollPosition;
      if (positionDiff > 0) {
        forwardPadding.size += positionDiff;
      } else {
        break;
      }
    }
  }

}
