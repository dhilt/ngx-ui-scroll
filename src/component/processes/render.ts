import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject } from '../interfaces/index';

export default class Render {

  static run(scroller: Scroller) {
    scroller.logger.stat('before new items render');
    scroller.cycleSubscriptions.push(
      scroller.bindData().subscribe(() => {
        scroller.state.sizeBeforeRender = scroller.viewport.getScrollableSize();
        if (Render.processElements(scroller)) {
          scroller.callWorkflow(<ProcessSubject>{
            process: Process.render,
            status: ProcessStatus.next
          });
        } else {
          scroller.callWorkflow(<ProcessSubject>{
            process: Process.render,
            status: ProcessStatus.error,
            payload: 'Can\'t associate item with element'
          });
        }
      })
    );
  }

  static processElements(scroller: Scroller) {
    const { fetch, fetch: { items } } = scroller.state;
    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      const element = scroller.viewport.element.querySelector(`[data-sid="${item.nodeId}"]`);
      if (!element) {
        return false;
      }
      item.element = <HTMLElement>element;
      item.element.style.left = '';
      item.element.style.position = '';
      item.invisible = false;
      item.setSize();
      scroller.buffer.cache.add(item);
      if (item.$index < fetch.minIndex) {
        fetch.negativeSize += item.size;
      }
    }
    scroller.logger.stat('after new items render');
    return true;
  }

}
