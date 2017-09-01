import Elements from '../elements'
import Direction from '../direction'
import Data from '../data'
import Process from './index'

class Render {

  static renderPending = false;

  static run(items = null, direction = null) {
    self.renderPending = true;
    setTimeout(() => {
      self.renderPending = false;
      if (items) {
        self.setElements(items);
      }
      if (direction === Direction.top) {
        self.adjustPosition(items);
      }
      self.adjust();
    });
  }

  static setElements(items) {
    items.forEach(item => {
      for (let i = Elements.viewport.childNodes.length - 1; i >= 0; i--) {
        let node = Elements.viewport.childNodes[i];
        if (node.id) {
          if (node.id === Data.getItemId(item.$index)) {
            item.element = node;
          }
        }
      }
      if (!item.element) { // todo: just remove this
        throw new Error('Can not associate item with element');
      }
    });
  }

  static adjustPosition(items) {
    let firstElementTop = items[0].element.getBoundingClientRect().top;
    let lastElementBottom = items[items.length - 1].element.getBoundingClientRect().bottom;
    let height = lastElementBottom - firstElementTop;
    Elements.viewport.scrollTop += height;
  }

  static adjust() {
    if (self.renderPending) {
      return;
    }
    if(Process.clip.runTop()) {
      self.run();
    }
    else {
      Process.main.run();
    }
  }

}

const self = Render;
export default Render
