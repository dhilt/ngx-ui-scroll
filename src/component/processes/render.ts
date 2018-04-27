import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class Render {

  static run(scroller: Scroller) {
    scroller.state.process = Process.render;

    scroller.cycleSubscriptions.push(
      scroller.bindData().subscribe(() => {
        if (Render.setElements(scroller)) {
          scroller.process$.next(<ProcessSubject>{
            process: Process.render
          });
        } else {
          scroller.process$.next(<ProcessSubject>{
            process: Process.render,
            stop: true,
            error: true,
            payload: 'Can not associate item with element'
          });
        }
      })
    );
  }

  static setElements(scroller: Scroller) {
    const items = scroller.state.fetch.items;
    for (let j = items.length - 1; j >= 0; j--) {
      const nodes = scroller.viewport.children;
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].getAttribute('data-sid') === items[j].nodeId) {
          items[j].element = nodes[i];
        }
      }
      if (!items[j].element) { // todo: is this situation possible?
        return false;
      }
    }
    return true;
  }
}
