import { Scroller } from '../scroller';

export default class Render {

  static run(scroller: Scroller): Scroller | Promise<any> {
    if (!scroller.state.fetch.hasNewItems) {
      return scroller;
    }
    // scroller.stat('start render');
    return scroller.bindData().then(() =>
      Render.setElements(scroller)
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
      if (!items[j].element) { // todo: do we really need this check?
        throw new Error('Can not associate item with element');
      }
    }
    return scroller;
  }
}
