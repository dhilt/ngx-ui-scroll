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

  static runBottom(items) {
    let height = 0;

    // make items visible
    items.forEach(item => {
      let element = item.element.children[0];
      element.style.left = '';
      element.style.position = '';
      let params = element.getBoundingClientRect();
      height += params.bottom - params.top;
      delete item.invisible;
    });

    const _paddingBottomHeight = parseInt(Elements.paddingBottom.style.height, 10) || 0;
    const paddingBottomHeight = Math.max(_paddingBottomHeight - height, 0);
    Elements.paddingBottom.style.height = paddingBottomHeight + 'px';
  }

  static runTop(items) {
    let height = 0;
    const _scrollTop = Elements.viewport.scrollTop;

    // make items visible
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
