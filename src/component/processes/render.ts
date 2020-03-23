import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';
import { Item } from '../classes/item';

export default class Render {

  static run(scroller: Scroller) {
    const { workflow, state: { clip, render } } = scroller;
    scroller.logger.stat('before new items render');
    scroller.innerLoopSubscriptions.push(
      scroller.bindData().subscribe(() => {
        if (Render.processElements(scroller)) {
          workflow.call({
            process: Process.render,
            status: render.noSize ? ProcessStatus.done : ProcessStatus.next,
            payload: { noClip: clip.noClip }
          });
        } else {
          workflow.call({
            process: Process.render,
            status: ProcessStatus.error,
            payload: { error: `Can't associate item with element` }
          });
        }
      })
    );
  }

  static processElements(scroller: Scroller): boolean {
    const { state, state: { fetch, fetch: { items }, render }, viewport, buffer } = scroller;
    const scrollBeforeRender = scroller.settings.windowViewport && fetch.isPrepend
      ? scroller.viewport.scrollPosition
      : null;
    if (!fetch.isReplace) {
      render.sizeBefore = viewport.getScrollableSize();
      render.fwdPaddingBefore = viewport.paddings.forward.size;
      if (!items.reduce((acc, item) => acc && Render.processElement(scroller, item), true)) {
        return false;
      }
    }
    fetch.hasAverageItemSizeChanged = buffer.checkAverageSize();
    render.sizeAfter = viewport.getScrollableSize();
    if (!render.noSize && scrollBeforeRender !== null) {
      Render.processWindowScrollBackJump(scroller, scrollBeforeRender);
    }
    scroller.logger.stat('after new items render');
    scroller.logger.log(() => render.noSize ? 'viewport size has not been changed' : void 0);
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
    const delta = inc * Math.abs(state.render.sizeAfter - state.render.sizeBefore);
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
