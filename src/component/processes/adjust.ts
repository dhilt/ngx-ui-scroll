import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus, ProcessSubject } from '../interfaces/index';

export default class Adjust {

  static MAX_SCROLL_ADJUSTMENTS_COUNT = 10;

  static run(scroller: Scroller) {
    // padding-elements adjustments
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

    // scroll position adjustments
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

    const oldPosition = viewport.scrollPosition;
    forwardPadding.size = fwdSize;
    backwardPadding.size = bwdSize;
    if (scroller.settings.windowViewport) {
      const positionDiff = oldPosition - viewport.scrollPosition;
      if (positionDiff) {
        Adjust.setScroll(scroller, positionDiff);
      }
    }

    scroller.logger.stat('after paddings adjustments');
    return bwdPaddingAverageSizeItemsCount;
  }

  static fixNegativeScroll(scroller: Scroller, bwdPaddingAverageSizeItemsCount: number) {
    const { viewport, buffer, state, state: { fetch, fetch: { items, negativeSize } } } = scroller;

    // if backward padding has been changed due to average item size change
    if (bwdPaddingAverageSizeItemsCount) {
      const oldPosition = state.preAdjustPosition;
      const averageItemSizeDiff = buffer.averageSize - fetch.averageItemSize;
      const bwdDiff = averageItemSizeDiff ? averageItemSizeDiff * state.bwdPaddingAverageSizeItemsCount -
        (state.bwdPaddingAverageSizeItemsCount - bwdPaddingAverageSizeItemsCount) * buffer.averageSize : 0;
      const positionDiff = oldPosition - viewport.scrollPosition + bwdDiff;
      if (positionDiff) {
        Adjust.setScroll(scroller, positionDiff);
        scroller.logger.stat('after scroll position adjustment (average)');
      }
      state.bwdPaddingAverageSizeItemsCount = bwdPaddingAverageSizeItemsCount;
    }

    // if scrollable area size has not been changed during this cycle
    if (state.sizeBeforeRender === viewport.getScrollableSize()) {
      return;
    }

    // no negative area items
    if (items[0].$index >= fetch.minIndex) {
      return;
    }

    if (negativeSize > 0) {
      Adjust.setScroll(scroller, negativeSize);
    } else if (negativeSize < 0) {
      viewport.padding.forward.size -= negativeSize;
      viewport.scrollPosition -= negativeSize;
    }
    scroller.logger.stat('after scroll position adjustment (negative)');
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
