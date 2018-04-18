import { Scroller } from '../scroller';

export default class Render {

  static run(scroller: Scroller): Scroller | Promise<any> {
    if (!scroller.state.fetch.hasNewItems) {
      return scroller;
    }
    // scroller.stat('start render');
    scroller.bindData();
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        const error = Render.setElements(scroller);
        if (!error) {
          resolve(scroller);
        } else {
          reject(error);
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
      if (!items[j].element) { // todo: do we really need this check?
        return new Error('Can not associate item with element');
      }
    }
  }
}
