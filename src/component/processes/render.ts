import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';
import { Item } from '../classes/item';

export default class Render {

  static run(scroller: Scroller) {
    scroller.logger.stat('before new items render');
    scroller.innerLoopSubscriptions.push(
      scroller.bindData().subscribe(() => {
        const elts = scroller.viewport.element.querySelectorAll(`tr:not([data-sid])`);
        if (elts && elts.length && elts.length === scroller.state.fetch.items.length) {
          elts.forEach((elt, index) => {
            (<any>elt).dataset['sid'] = scroller.state.fetch.items[index].nodeId;
          });
        if (Render.processElements(scroller)) {
          scroller.callWorkflow({
            process: Process.render,
            status: ProcessStatus.next,
            payload: { noClip: scroller.state.clip.noClip }
          });
        } } else {
          scroller.callWorkflow({
            process: Process.render,
            status: ProcessStatus.error,
            payload: { error: 'Can\'t associate item with element' }
          });
        }
      })
    );
  }

  static processElements(scroller: Scroller): boolean {
    const { state, state: { fetch, fetch: { items } }, viewport, buffer } = scroller;
    const scrollBeforeRender = scroller.settings.windowViewport && fetch.isPrepend
      ? scroller.viewport.scrollPosition
      : null;
    if (!fetch.isReplace) {
      state.sizeBeforeRender = viewport.getScrollableSize();
      state.fwdPaddingBeforeRender = viewport.paddings.forward.size;
      if (!items.reduce((acc, item) => acc && Render.processElement(scroller, item), true)) {
        return false;
      }
    }
    fetch.hasAverageItemSizeChanged = buffer.checkAverageSize();
    state.sizeAfterRender = viewport.getScrollableSize();
    if (scrollBeforeRender !== null) {
      Render.processWindowScrollBackJump(scroller, scrollBeforeRender);
    }
    scroller.logger.stat('after new items render');
    return true;
  }

  static processElement(scroller: Scroller, item: Item): boolean {
    const { state: { fetch }, viewport, buffer } = scroller;
    const element = viewport.element.querySelector(`[data-sid="${item.nodeId}"]`);
    if (!element) {
      return false;
    }
    item.element = <HTMLElement>element;
    item.element.style.left = '';
    item.element.style.position = '';
    item.element.classList.remove('temp');
    item.invisible = false;
    item.setSize();
    buffer.cache.add(item);
    if (item.$index < fetch.minIndex) {
      fetch.negativeSize += item.size;
    }
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
