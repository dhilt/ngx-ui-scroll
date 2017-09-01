import Data from '../data'
import Elements from '../elements'

class Clip {

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
    return false;
  }

}

export default Clip
