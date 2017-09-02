import Elements from '../elements'
import Direction from '../direction'
import Data from '../data'
import Process from './index'

class Adjust {

  static run(direction, items) {
    if (direction === Direction.top) {
      self.runTop(items);
    }
    if (direction === Direction.bottom) {
      self.runBottom(items);
    }
  }

  static processInvisibleItems(items) {
    for (let i = items.length - 1; i >= 0; i--) {
      let element = items[i].element.children[0];
      element.style.left = '';
      element.style.position = '';
      delete items[i].invisible;
    }
    return Math.abs(items[0].element.getBoundingClientRect().top - items[items.length - 1].element.getBoundingClientRect().bottom);
  }

  static runBottom(items) {
    const height = self.processInvisibleItems(items);
    const _paddingBottomHeight = parseInt(Elements.paddingBottom.style.height, 10) || 0;
    const paddingBottomHeight = Math.max(_paddingBottomHeight - height, 0);
    Elements.paddingBottom.style.height = paddingBottomHeight + 'px';
  }

  static runTop(items) {
    const _scrollTop = Elements.viewport.scrollTop;
    let height = self.processInvisibleItems(items);

    // now need to make "height" pixels top
    // 1) via paddingTop
    let _paddingTopHeight = parseInt(Elements.paddingTop.style.height, 10) || 0;
    let paddingTopHeight = Math.max(_paddingTopHeight - height, 0);
    Elements.paddingTop.style.height = paddingTopHeight + 'px';
    let paddingDiff = height - (_paddingTopHeight - paddingTopHeight);
    // 2) via scrollTop
    if (paddingDiff > 0) {
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

}

const self = Adjust;
export default Adjust
