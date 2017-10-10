import Data from '../data'
import Elements from '../elements'
import Direction from '../direction'

class Clip {

  static run(direction) {
    if (direction === Direction.top) {
      return self.runTop();
    }
    if (direction === Direction.bottom) {
      return self.runBottom();
    }
  }

  static runTop() {
    let viewportParams = Elements.viewport.getBoundingClientRect();
    let viewportTop = viewportParams.top;
    let delta = viewportParams.height * Data.padding;
    let bottomLimit = viewportTop - delta;
    let limit = Data.items.length - 1;
    let i = 0, min = 0, lastElementBottom, cutHeight, found = -1;

    // edge case: all items should be clipped
    const lastItem = Data.items[limit];
    lastElementBottom = lastItem.element.getBoundingClientRect().bottom;
    if (lastElementBottom < bottomLimit) {
      cutHeight = Math.abs(Data.items[0].element.getBoundingClientRect().top - lastElementBottom);
      found = limit;
    }
    else {
      for (i = 0; i <= limit; i++) {
        const element = Data.items[i].element;
        if(element.getBoundingClientRect().bottom > bottomLimit) {
          found = i - 1;
          break;
        }
      }
      if(found >= 0) {
        cutHeight = Data.items[found].element.getBoundingClientRect().bottom -
          Data.items[0].element.getBoundingClientRect().top;
      }
    }

    if(found >= 0) {
      for (i = 0; i <= found; i++) {
        Data.items[i].element.style.display = 'none';
      }
      let paddingHeight = parseInt(Elements.paddingTop.style.height, 10) || 0;
      Elements.paddingTop.style.height = (paddingHeight + cutHeight) + 'px';
      Data.lastIndex = found === limit ? Data.items[limit].$index : null;
      Data.items.splice(0, found + 1);
      return true;
    }

    return false;
  }

  static runBottom() {
    let viewportParams = Elements.viewport.getBoundingClientRect();
    let viewportBottom = viewportParams.bottom;
    let delta = viewportParams.height * Data.padding;
    let topLimit = viewportBottom + delta;
    let limit = Data.items.length - 1;
    let i, firstElementTop, lastElementBottom, cutHeight, found = -1;

    // edge case: all items should be clipped
    const firstItem = Data.items[0];
    firstElementTop = firstItem.element.getBoundingClientRect().top;
    if (firstElementTop > topLimit) {
      cutHeight = Math.abs(Data.items[limit].element.getBoundingClientRect().bottom - firstElementTop);
      found = 0;
    }
    else {
      for (i = limit; i >= 0; i--) {
        const element = Data.items[i].element;
        if(element.getBoundingClientRect().top < topLimit) {
          found = i + 1;
          break;
        }
      }
      if(found >= 0) {
        cutHeight = Data.items[limit].element.getBoundingClientRect().bottom -
          Data.items[found].element.getBoundingClientRect().top;
      }
    }

    if(found >= 0) {
      for (i = found; i <= limit; i++) {
        Data.items[i].element.style.display = 'none';
      }
      let paddingHeight = parseInt(Elements.paddingBottom.style.height, 10) || 0;
      Elements.paddingBottom.style.height = (paddingHeight + cutHeight) + 'px';
      Data.lastIndex = found === 0 ? Data.items[0].$index : null;
      Data.items.splice(found, limit + 1 - found);
      return true;
    }

    return false;
  }

}

const self = Clip;
export default Clip
