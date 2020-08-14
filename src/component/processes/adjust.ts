import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus } from '../interfaces/index';

export default class Adjust {

  static process = Process.adjust;
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
    const { hasAverageItemSizeChanged } = fetch;
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
      for (index = firstIndex; index < (fetch.first.indexBuffer as number); index++) {
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
    const { adjust, fetch, render, scrollState } = state;

    let position = viewport.paddings.backward.size;
    if (fetch.firstVisibleIndex !== null && buffer.firstIndex !== null) {
      for (let i = buffer.firstIndex; i < fetch.firstVisibleIndex; i++) {
        position += buffer.getSizeByIndex(i);
      }
      if (fetch.firstVisibleItemDelta) {
        position -= fetch.firstVisibleItemDelta;
      }
    } else {
      if (fetch.isPrepend && fetch.negativeSize) {
        position += fetch.negativeSize;
      }
    }

    if (scrollState.positionBeforeAsync !== null) {
      const diff = render.positionBefore - scrollState.positionBeforeAsync;
      if (diff !== 0) {
        scroller.logger.log(`shift position due to fetch-render difference (${diff})`);
        position += diff;
      }
    }

    viewport.scrollPosition = position;
    scroller.logger.stat('after scroll position adjustment');
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
