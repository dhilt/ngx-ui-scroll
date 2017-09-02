import Data from '../data'
import Elements from '../elements'
import Direction from '../direction'

class Clip {

  static run(direction) {
    if (direction === Direction.top) {
      self.runTop();
    }
    if (direction === Direction.bottom) {
      self.runBottom();
    }
  }

  static runTop() {
    let viewportParams = Elements.viewport.getBoundingClientRect();
    let viewportTop = viewportParams.top;
    let delta = viewportParams.height * Data.padding;
    let i, firstElementTop, lastElementBottom;
    for (i = 0; i < Data.items.length; i++) {
      let elementParams = Data.items[i].element.getBoundingClientRect();
      if (elementParams.bottom < viewportTop - delta) {
        if (i === 0) {
          firstElementTop = elementParams.top;
        }
        lastElementBottom = elementParams.bottom;
        continue;
      }
      if (i === 0) {
        break;
      }
      for (let j = i - 1; j >= 0; j--) {
        Data.items[j].element.style.display = 'none';
      }
      let cutHeight = lastElementBottom - firstElementTop;
      let paddingHeight = parseInt(Elements.paddingTop.style.height, 10) || 0;
      Elements.paddingTop.style.height = (paddingHeight + cutHeight) + 'px';
      Data.items.splice(0, i);
      return true;
    }
    return false;
  }

  static runBottom() {
    let viewportParams = Elements.viewport.getBoundingClientRect();
    let viewportBottom = viewportParams.bottom;
    let delta = viewportParams.height * Data.padding;
    let limit = Data.items.length - 1;
    let i, firstElementTop, lastElementBottom;
    for (i = limit; i >= 0; i--) {
      let elementParams = Data.items[i].element.getBoundingClientRect();
      if (elementParams.top > viewportBottom + delta) {
        if (i === limit) {
          lastElementBottom = elementParams.bottom;
        }
        firstElementTop = elementParams.top;
        continue;
      }
      if (i === limit) {
        break;
      }
      for (let j = i + 1; j <= limit; j++) {
        Data.items[j].element.style.display = 'none';
      }
      let cutHeight = lastElementBottom - firstElementTop;
      let paddingHeight = parseInt(Elements.paddingBottom.style.height, 10) || 0;
      Elements.paddingBottom.style.height = (paddingHeight + cutHeight) + 'px';
      Data.items.splice(i + 1, limit - i);
      return true;
    }
    return false;
  }

}

const self = Clip;
export default Clip
