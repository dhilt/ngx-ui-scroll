import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Adjust {

  static process = Process.adjust;
  static MAX_SCROLL_ADJUSTMENTS_COUNT = 10;

  static run(scroller: Scroller) {
    const { workflow, viewport } = scroller;
    const positionBeforeAdjust = viewport.scrollPosition;

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
    if (positionBeforeAdjust !== scrollPosition && previousPosition !== scrollPosition) {
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
    const { viewport, buffer, settings: { inverse } } = scroller;
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
    let index, bwdSize = 0, fwdSize = 0;

    // new backward padding
    for (index = minIndex; index < firstIndex; index++) {
      const item = buffer.cache.get(index);
      bwdSize += item ? item.size : buffer.cache.averageSize;
    }

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
    const { fetch, render, scrollState } = state;
    let position = viewport.paddings.backward.size;

    // backward outlet increase
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

    // change per slow fetch/render
    if (scrollState.positionBeforeAsync !== null) {
      const diff = render.positionBefore - scrollState.positionBeforeAsync;
      if (diff !== 0) {
        scroller.logger.log(`shift position due to fetch-render difference (${diff})`);
        position += diff;
      }
    }

    // offset increase
    if (viewport.offset > 0 && (position || fetch.positions.before)) {
      position += viewport.offset;
    }

    viewport.scrollPosition = Math.round(position);
    scroller.logger.stat('after scroll position adjustment');
  }

}
