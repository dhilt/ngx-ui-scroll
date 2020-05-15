import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus } from '../interfaces/index';

export default class Adjust {

  static MAX_SCROLL_ADJUSTMENTS_COUNT = 10;

  static run(scroller: Scroller) {
    const { workflow, state: { adjust }, viewport } = scroller;
    adjust.positionBefore = viewport.scrollPosition;

    // padding-elements adjustments
    if (!Adjust.setPaddings(scroller)) {
      workflow.call({
        process: Process.adjust,
        status: ProcessStatus.error,
        payload: { error: `Can't get visible item` }
      });
      return;
    }

    // scroll position adjustments
    Adjust.fixScrollPosition(scroller);

    // re-set scroll position (if changed) via animation frame
    const { scrollPosition, previousPosition } = viewport;
    if (adjust.positionBefore !== scrollPosition && previousPosition !== scrollPosition) {
      viewport.setPositionSafe(previousPosition, scrollPosition, () =>
         workflow.call({
          process: Process.adjust,
          status: ProcessStatus.done
        })
      );
      return;
    }

    workflow.call({
      process: Process.adjust,
      status: ProcessStatus.done
    });
  }

  static setPaddings(scroller: Scroller): boolean {
    const { viewport, buffer, state: { adjust, fetch }, settings: { inverse } } = scroller;
    const firstItem = buffer.getFirstVisibleItem();
    const lastItem = buffer.getLastVisibleItem();
    if (!firstItem || !lastItem) {
      return false;
    }
    const { forward, backward } = viewport.paddings;
    const firstIndex = firstItem.$index;
    const lastIndex = lastItem.$index;
    const minIndex = isFinite(buffer.absMinIndex) ? buffer.absMinIndex : buffer.minIndex;
    const maxIndex = isFinite(buffer.absMaxIndex) ? buffer.absMaxIndex : buffer.maxIndex;
    const { hasAverageItemSizeChanged, firstIndexBuffer } = fetch;
    let index, bwdSize = 0, fwdSize = 0, itemsCount = 0;

    // new backward padding
    for (index = minIndex; index < firstIndex; index++) {
      const item = buffer.cache.get(index);
      bwdSize += item ? item.size : buffer.cache.averageSize;
      if (hasAverageItemSizeChanged) {
        itemsCount += !item ? 1 : 0;
      }
    }
    if (hasAverageItemSizeChanged) {
      for (index = firstIndex; index < (firstIndexBuffer as number); index++) {
        itemsCount += !buffer.cache.get(index) ? 1 : 0;
      }
    }
    adjust.bwdAverageSizeItemsCount = itemsCount;

    // new forward padding
    for (index = lastIndex + 1; index <= maxIndex; index++) {
      const item = buffer.cache.get(index);
      fwdSize += item ? item.size : buffer.cache.averageSize;
    }

    // lack of items case
    const bufferSize = viewport.getScrollableSize() - forward.size - backward.size;
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

    backward.size = bwdSize;
    forward.size = fwdSize;

    scroller.logger.stat('after paddings adjustments');
    return true;
  }

  static fixScrollPosition(scroller: Scroller) {
    const { viewport, buffer, state } = scroller;
    const { adjust, fetch, render } = state;
    const { bwdAverageSizeItemsCount } = adjust;
    let positionNew = viewport.scrollPosition;
    let posDiff = adjust.positionBefore - positionNew;
    let negative = fetch.negativeSize;

    // if scroll anchoring is in game
    if (viewport.scrollAnchoring && posDiff) {
      Adjust.setScroll(scroller, posDiff);
      positionNew = viewport.scrollPosition;
      posDiff = adjust.positionBefore - positionNew;
      scroller.logger.stat('after scroll position adjustment (anchoring)');
    }

    // if backward padding has been changed due to average item size change
    const bwdAverageItemsCountDiff = fetch.isReplace ? 0 : state.bwdAverageSizeItemsCount - bwdAverageSizeItemsCount;
    const hasBwdParamsChanged = bwdAverageSizeItemsCount > 0 || bwdAverageItemsCountDiff > 0;
    if (fetch.hasAverageItemSizeChanged && hasBwdParamsChanged) {
      const _bwdAverageSize = bwdAverageSizeItemsCount * buffer.averageSize;
      const bwdAverageSize = bwdAverageSizeItemsCount * fetch.averageItemSize;
      const bwdAverageSizeDiff = _bwdAverageSize - bwdAverageSize;
      const bwdAverageItemsSizeDiff = bwdAverageItemsCountDiff * fetch.averageItemSize;
      const bwdDiff = bwdAverageSizeDiff - bwdAverageItemsSizeDiff;
      const positionDiff = posDiff + bwdDiff;
      if (positionDiff) {
        if (scroller.settings.changeOverflow) {
          viewport.disableScrollForOneLoop();
        }
        Adjust.setScroll(scroller, positionDiff);
        scroller.logger.stat('after scroll position adjustment (average)');
      }
      state.bwdAverageSizeItemsCount = bwdAverageSizeItemsCount;
    }

    // no negative area items
    if (!fetch.items.length || fetch.items[0].$index >= fetch.minIndex) {
      return;
    }

    // if scrollable area size has not been changed during this cycle
    if (viewport.getScrollableSize() === render.sizeBefore) {
      return;
    }

    // to fill forward padding gap in case of no minIndex
    if (!isFinite(buffer.absMinIndex)) {
      const fwdBefore = Math.max(0, render.fwdPaddingBefore - viewport.offset);
      const fwdPaddingSizeDiff = fwdBefore - viewport.paddings.forward.size;
      const diff = negative - fwdPaddingSizeDiff;
      negative = diff < 0 ? negative : Math.min(negative, diff);
    }

    if (negative > 0) {
      Adjust.setScroll(scroller, negative);
    } else if (negative < 0) {
      viewport.paddings.forward.size -= negative;
      viewport.scrollPosition -= negative;
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
