import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';
import { Item } from '../classes/item';

export default class Render {

  static process = Process.render;

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
    const { state: { fetch, render }, viewport, buffer, logger } = scroller;
    if (!fetch.isReplace) {
      render.sizeBefore = viewport.getScrollableSize();
      render.fwdPaddingBefore = viewport.paddings.forward.size;
      const success = fetch.items.reduce((acc, item) =>
        acc && Render.processElement(scroller, item)
      , true);
      if (!success) {
        return false;
      }
    }
    fetch.hasAverageItemSizeChanged = buffer.checkAverageSize();
    render.sizeAfter = viewport.getScrollableSize();
    logger.stat('after new items render');
    logger.log(() => render.noSize ? 'viewport size has not been changed' : void 0);
    return true;
  }

  static processElement(scroller: Scroller, item: Item): boolean {
    const { state: { fetch }, viewport, buffer } = scroller;
    const element = viewport.element.querySelector(`[data-sid="${item.nodeId}"]`);
    if (!element) {
      return false;
    }
    item.element = element as HTMLElement;
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

}
