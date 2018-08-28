import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class Render {

  static run(scroller: Scroller) {
    scroller.state.process = Process.render;

    scroller.logger.stat('Before render new items');
    scroller.cycleSubscriptions.push(
      scroller.bindData().subscribe(() => {
        if (Render.setElements(scroller)) {
          scroller.callWorkflow(<ProcessSubject>{
            process: Process.render,
            status: 'next'
          });
        } else {
          scroller.callWorkflow(<ProcessSubject>{
            process: Process.render,
            status: 'error',
            payload: 'Can\'t associate item with element'
          });
        }
      })
    );
  }

  static setElements(scroller: Scroller) {
    const items = scroller.state.fetch.items;
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
    }
    scroller.logger.stat('After render new items');
    return true;
  }

}
