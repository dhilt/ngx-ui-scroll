import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Render {

  static run(scroller: Scroller) {
    scroller.logger.stat('before new items render');
    scroller.innerLoopSubscriptions.push(
      scroller.bindData().subscribe(() => {
        if (Render.processElements(scroller)) {
          scroller.callWorkflow({
            process: Process.render,
            status: ProcessStatus.next
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
    buffer.checkAverageSize();
    if (scroller.settings.windowViewport) {
      Render.processWindowScrollBackJump(scroller, scrollBeforeRender);
    }
    scroller.logger.stat('after new items render');
    return true;
  }

  static processWindowScrollBackJump(scroller: Scroller, scrollBeforeRender: number) {
    const { state, state: { fetch: { isPrepend }, scrollState: { window } }, viewport, buffer } = scroller;
    // if new items have been rendered in the area that is before current scroll position
    // then this position will be updated (immediately or almost immediately) in case of entire window scrollable
    // that's why we need to remember the delta and to update scroll position when the nearest scroll event is handled
    if (isPrepend) {
      const inc = scrollBeforeRender >= viewport.paddings.backward.size ? 1 : -1;
      const delta = inc * Math.abs(viewport.getScrollableSize() - state.sizeBeforeRender);
      window.positionToUpdate = scrollBeforeRender - delta;
      window.delta = delta;
    }
  }

}
