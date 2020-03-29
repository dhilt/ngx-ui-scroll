import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus } from '../interfaces/index';

export default class Adjust {

  static MAX_SCROLL_ADJUSTMENTS_COUNT = 10;

  static run(scroller: Scroller) {
    const { workflow, state, viewport } = scroller;
    state.preAdjustPosition = viewport.scrollPosition;

    // padding-elements adjustments
    const setPaddingsResult =
      Adjust.setPaddings(scroller);

    if (setPaddingsResult === null) {
      workflow.call({
        process: Process.adjust,
        status: ProcessStatus.error,
        payload: { error: `Can't get visible item` }
      });
      return;
    }

    // scroll position adjustments
    Adjust.fixScrollPosition(scroller, setPaddingsResult);

    workflow.call({
      process: Process.adjust,
      status: ProcessStatus.done
    });
  }

  static setPaddings(scroller: Scroller): null | number {
    const { viewport, buffer, state: { fetch }, settings: { inverse } } = scroller;
    const firstItem = buffer.getFirstVisibleItem();
    const lastItem = buffer.getLastVisibleItem();
    if (!firstItem || !lastItem) {
      return null;
    }
    const forwardPadding = viewport.paddings.forward;
    const backwardPadding = viewport.paddings.backward;
    const firstIndex = firstItem.$index;
    const lastIndex = lastItem.$index;
    const minIndex = isFinite(buffer.absMinIndex) ? buffer.absMinIndex : buffer.minIndex;
    const maxIndex = isFinite(buffer.absMaxIndex) ? buffer.absMaxIndex : buffer.maxIndex;
    const hasAverageItemSizeChanged = fetch.hasAverageItemSizeChanged;
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
      for (index = firstIndex; index < (fetch.firstIndexBuffer as number); index++) {
        bwdPaddingAverageSizeItemsCount += !buffer.cache.get(index) ? 1 : 0;
      }
    }

    // new forward padding
    for (index = lastIndex + 1; index <= maxIndex; index++) {
      const item = buffer.cache.get(index);
      fwdSize += item ? item.size : buffer.cache.averageSize;
    }

    // lack of items case
    const bufferSize = viewport.getScrollableSize() - forwardPadding.size - backwardPadding.size;
    const viewportSizeDiff = viewport.getSize() - (bwdSize + bufferSize + fwdSize);
    if (viewportSizeDiff > 0) {
      if (inverse) {
        bwdSize += viewportSizeDiff;
      } else {
        fwdSize += viewportSizeDiff;
      }
      scroller.logger.log(() =>
        inverse ? 'backward' : 'forward' + ` padding will be increased by ${viewportSizeDiff} to fill the viewport`
      );
    }

    forwardPadding.size = fwdSize;
    backwardPadding.size = bwdSize;

    scroller.logger.stat('after paddings adjustments');
    return bwdPaddingAverageSizeItemsCount;
  }

  static fixScrollPosition(scroller: Scroller, bwdPaddingAverageSizeItemsCount: number) {
    const { viewport, buffer, state, state: { fetch, fetch: { items } } } = scroller;
    const newPosition = viewport.scrollPosition;
    const posDiff = state.preAdjustPosition - newPosition;
    let { negativeSize } = fetch;

    if (scroller.settings.windowViewport) {
      if (posDiff) {
        const winState = state.scrollState.window;
        if (newPosition === winState.positionToUpdate) {
          winState.reset();
          scroller.logger.log(() => `process window scroll preventive: sum(${newPosition}, ${posDiff})`);
          Adjust.setScroll(scroller, posDiff);
          scroller.logger.stat('after scroll position adjustment (window)');
          return;
        }
      }
    }

    // if backward padding has been changed due to average item size change
    const bwdAverageItemsCountDiff = fetch.isReplace ? 0 :
      state.bwdPaddingAverageSizeItemsCount - bwdPaddingAverageSizeItemsCount;
    const hasBwdParamsChanged = bwdPaddingAverageSizeItemsCount > 0 || bwdAverageItemsCountDiff > 0;
    if (fetch.hasAverageItemSizeChanged && hasBwdParamsChanged) {
      const _bwdPaddingAverageSize = bwdPaddingAverageSizeItemsCount * buffer.averageSize;
      const bwdPaddingAverageSize = bwdPaddingAverageSizeItemsCount * fetch.averageItemSize;
      const bwdPaddingAverageSizeDiff = _bwdPaddingAverageSize - bwdPaddingAverageSize;
      const bwdAverageItemsSizeDiff = bwdAverageItemsCountDiff * fetch.averageItemSize;
      const bwdDiff = bwdPaddingAverageSizeDiff - bwdAverageItemsSizeDiff;
      const positionDiff = posDiff + bwdDiff;
      if (positionDiff) {
        if (scroller.settings.changeOverflow) {
          viewport.disableScrollForOneLoop();
        }
        Adjust.setScroll(scroller, positionDiff);
        scroller.logger.stat('after scroll position adjustment (average)');
      }
      state.bwdPaddingAverageSizeItemsCount = bwdPaddingAverageSizeItemsCount;
    }

    // no negative area items
    if (!items.length || items[0].$index >= fetch.minIndex) {
      return;
    }

    // if scrollable area size has not been changed during this cycle
    if (viewport.getScrollableSize() === state.render.sizeBefore) {
      return;
    }

    // to fill forward padding gap in case of no minIndex
    if (!isFinite(buffer.absMinIndex)) {
      const fwdPaddingSizeDiff = state.render.fwdPaddingBefore - viewport.paddings.forward.size;
      const diff = negativeSize - fwdPaddingSizeDiff;
      negativeSize = diff < 0 ? negativeSize : Math.min(negativeSize, diff);
    }

    if (negativeSize > 0) {
      Adjust.setScroll(scroller, negativeSize);
    } else if (negativeSize < 0) {
      viewport.paddings.forward.size -= negativeSize;
      viewport.scrollPosition -= negativeSize;
    }
    scroller.logger.stat('after scroll position adjustment (negative)');
  }

  static setScroll(scroller: Scroller, delta: number) {
    const { viewport, settings: { inverse } } = scroller;
    const viewportSize = viewport.getSize();
    const forwardPadding = viewport.paddings[Direction.forward];
    const oldPosition = viewport.scrollPosition;
    const newPosition = Math.round(oldPosition + delta);
    for (let i = 0; i < Adjust.MAX_SCROLL_ADJUSTMENTS_COUNT; i++) {
      viewport.scrollPosition = newPosition;
      const positionDiff = newPosition - viewport.scrollPosition;
      const viewportDiff = viewportSize - newPosition;
      const diff = Math.min(viewportDiff, positionDiff);
      if (!inverse && diff > 0) {
        forwardPadding.size += diff;
      } else {
        break;
      }
    }
  }

}
