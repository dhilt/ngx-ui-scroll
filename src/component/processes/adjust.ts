import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus } from '../interfaces/index';

export default class Adjust {

  static MAX_SCROLL_ADJUSTMENTS_COUNT = 10;

  static run(scroller: Scroller) {
    scroller.state.preAdjustPosition = scroller.viewport.scrollPosition;

    // padding-elements adjustments
    const setPaddingsResult =
      Adjust.setPaddings(scroller);

    if (setPaddingsResult === false) {
      scroller.callWorkflow({
        process: Process.adjust,
        status: ProcessStatus.error,
        payload: { error: 'Can\'t get visible item' }
      });
      return;
    }

    // scroll position adjustments
    Adjust.fixScrollPosition(scroller, <number>setPaddingsResult);

    scroller.callWorkflow({
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
    const forwardPadding = viewport.paddings.forward;
    const backwardPadding = viewport.paddings.backward;
    const firstIndex = firstItem.$index;
    const lastIndex = lastItem.$index;
    const minIndex = isFinite(buffer.absMinIndex) ? buffer.absMinIndex : buffer.minIndex;
    const maxIndex = isFinite(buffer.absMaxIndex) ? buffer.absMaxIndex : buffer.maxIndex;
    const hasAverageItemSizeChanged = buffer.averageSize !== fetch.averageItemSize;
    let index, bwdSize = 0, fwdSize = 0, bwdPaddingAverageSizeItemsCount = 0;

    // new backward padding
    for (index = minIndex; index < firstIndex; index++) {
      const item = buffer.cache.get(index);
      bwdSize += item ? item.size : buffer.cache.averageSize;
      if (hasAverageItemSizeChanged) {
        bwdPaddingAverageSizeItemsCount += !item ? 1 : 0;
      }
    }
    if (hasAverageItemSizeChanged) {
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

    scroller.logger.stat('after paddings adjustments');
    return bwdPaddingAverageSizeItemsCount;
  }

  static fixScrollPosition(scroller: Scroller, bwdPaddingAverageSizeItemsCount: number) {
    const { viewport, buffer, state, state: { fetch, fetch: { items, negativeSize } } } = scroller;

    if (scroller.settings.windowViewport) {
      const newPosition = viewport.scrollPosition;
      const posDiff = state.preAdjustPosition - newPosition;
      if (posDiff) {
        const winState = state.scrollState.window;
        if (newPosition === winState.positionToUpdate) {
          winState.reset();
          state.syntheticScroll.readyToReset = false;
          scroller.logger.log(() => `process window scroll preventive: sum(${newPosition}, ${posDiff})`);
          Adjust.setScroll(scroller, posDiff);
        }
      }
    }

    // if backward padding has been changed due to average item size change
    const hasAverageItemSizeChanged = buffer.averageSize !== fetch.averageItemSize;
    const bwdAverageItemsCountDiff = state.bwdPaddingAverageSizeItemsCount - bwdPaddingAverageSizeItemsCount;
    const hasBwdParamsChanged = bwdPaddingAverageSizeItemsCount > 0 || bwdAverageItemsCountDiff > 0;
    if (hasAverageItemSizeChanged && hasBwdParamsChanged) {
      const _bwdPaddingAverageSize = bwdPaddingAverageSizeItemsCount * buffer.averageSize;
      const bwdPaddingAverageSize = bwdPaddingAverageSizeItemsCount * fetch.averageItemSize;
      const bwdPaddingAverageSizeDiff = _bwdPaddingAverageSize - bwdPaddingAverageSize;
      const bwdAverageItemsSizeDiff = bwdAverageItemsCountDiff * fetch.averageItemSize;
      const positionDiff = bwdPaddingAverageSizeDiff - bwdAverageItemsSizeDiff;
      if (positionDiff) {
        Adjust.setScroll(scroller, positionDiff);
        scroller.logger.stat('after scroll position adjustment (average)');
      }
      state.bwdPaddingAverageSizeItemsCount = bwdPaddingAverageSizeItemsCount;
    }

    // no need to 'return' in case of entire window scrollable
    // if (!scroller.settings.windowViewport) {
    // if scrollable area size has not been changed during this cycle
    if (/*!scroller.settings.windowViewport && */state.sizeBeforeRender === viewport.getScrollableSize()) {
      return;
    }
    // no negative area items
    if (items[0].$index >= fetch.minIndex) {
      return;
    }
    // }

    if (negativeSize > 0) {
      Adjust.setScroll(scroller, negativeSize);
    } else if (negativeSize < 0) {
      viewport.paddings.forward.size -= negativeSize;
      viewport.scrollPosition -= negativeSize;
    }
    scroller.logger.stat('after scroll position adjustment (negative)');
  }

  static setScroll(scroller: Scroller, delta: number) {
    const { viewport } = scroller;
    const forwardPadding = viewport.paddings[Direction.forward];
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
