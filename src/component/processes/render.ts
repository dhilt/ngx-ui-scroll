import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Render {

  static run(scroller: Scroller) {
    scroller.logger.stat('before new items render');
    const { fetch } = scroller.state;
    fetch.items.forEach(item => {
      if (item.$index < fetch.minIndex) {
        fetch.negativeSizeBeforeRender += scroller.buffer.getSizeByIndex(item.$index);
      }
    });
    scroller.innerLoopSubscriptions.push(
      scroller.bindData().subscribe(() => {
        if (Render.processElements(scroller)) {
          scroller.callWorkflow({
            process: Process.render,
            status: ProcessStatus.next,
            payload: { noClip: scroller.state.noClip }
          });
        } else {
          scroller.callWorkflow({
            process: Process.render,
            status: ProcessStatus.error,
            payload: { error: 'Can\'t associate item with element' }
          });
        }
      })
    );
  }

  static processElements(scroller: Scroller) {
    const { state, state: { fetch, fetch: { items } }, viewport, buffer } = scroller;
    const itemsLength = items.length;
    const scrollBeforeRender = scroller.settings.windowViewport ? scroller.viewport.scrollPosition : 0;
    state.sizeBeforeRender = viewport.getScrollableSize();
    state.fwdPaddingBeforeRender = viewport.paddings.forward.size;
    state.bwdPaddingBeforeRender = viewport.paddings.backward.size;
    for (let j = 0; j < itemsLength; j++) {
      const item = items[j];
      const element = viewport.element.querySelector(`[data-sid="${item.nodeId}"]`);
      if (!element) {
        return false;
      }
      item.element = <HTMLElement>element;
      item.element.style.left = '';
      item.element.style.position = '';
      item.invisible = false;
      item.setSize();
      buffer.cache.add(item);
      if (item.$index < fetch.minIndex) {
        fetch.negativeSize += item.size;
      }
    }
    fetch.hasAverageItemSizeChanged = buffer.checkAverageSize();
    state.sizeAfterRender = viewport.getScrollableSize();
    if (scroller.settings.windowViewport && fetch.isPrepend) {
      Render.processWindowScrollBackJump(scroller, scrollBeforeRender);
    }
    scroller.logger.stat('after new items render');
    return true;
  }

  static processWindowScrollBackJump(scroller: Scroller, scrollBeforeRender: number) {
    const { state, state: { scrollState: { window } }, viewport } = scroller;
    // if new items have been rendered in the area that is before current scroll position
    // then this position will be updated silently in case of entire window scrollable
    // so we need to remember the delta and to update scroll position manually right after it is changed silently
    const inc = scrollBeforeRender >= viewport.paddings.backward.size ? 1 : -1;
    const delta = inc * Math.abs(state.sizeAfterRender - state.sizeBeforeRender);
    const positionToUpdate = scrollBeforeRender - delta;
    if (delta && positionToUpdate > 0) {
      window.positionToUpdate = positionToUpdate;
      window.delta = delta;
      scroller.logger.log(() => {
        const token = delta < 0 ? 'reduced' : 'increased';
        return [`next scroll position (if ${positionToUpdate}) should be ${token} by`, Math.abs(delta)];
      });
    }
  }

}
