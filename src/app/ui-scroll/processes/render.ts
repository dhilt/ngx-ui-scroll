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
      self.adjust(direction);
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
    let height = 0;
    const _scrollTop = Elements.viewport.scrollTop;
    items.forEach(item => {
      let element = item.element.children[0];
      element.style.left = '';
      element.style.position = '';
      let params = element.getBoundingClientRect();
      height += params.bottom - params.top;
      delete item.invisible;
    });
    // now need to make "height" pixels top

    // 1) via paddingTop
    let _paddingTopHeight = parseInt(Elements.paddingTop.style.height, 10) || 0;
    let paddingTopHeight = Math.max(_paddingTopHeight - height, 0);
    Elements.paddingTop.style.height = paddingTopHeight + 'px';
    let paddingDiff = height - (_paddingTopHeight - paddingTopHeight);
    // 2) via scrollTop
    if(paddingDiff > 0) {
      height = paddingDiff;
      Elements.viewport.scrollTop += height;
      const diff = height - Elements.viewport.scrollTop - _scrollTop;
      if (diff > 0) {
        let paddingHeight = parseInt(Elements.paddingBottom.style.height, 10) || 0;
        Elements.paddingBottom.style.height = (paddingHeight + diff) + 'px';
        Elements.viewport.scrollTop += diff;
      }
    }
  }

  static adjust(direction = null) {
    if (self.renderPending) {
      return;
    }
    if (Process.clip.run(direction)) {
      self.run();
    }
    else {
      Process.fetch.run(direction);
    }
  }

}

const self = Render;
export default Render
