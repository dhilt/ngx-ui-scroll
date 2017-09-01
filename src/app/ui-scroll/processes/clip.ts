import Data from '../data'
import Elements from '../elements'

class Clip {

  static runTop() {
    let viewportParams = Elements.viewport.getBoundingClientRect();
    let viewportTop = viewportParams.top;
    let delta = viewportParams.height * Data.padding;
    let cutItemIndex = null;
    for (let i = 0; i < Data.items.length; i++) {
      let elementParams = Data.items[i].element.getBoundingClientRect();
      if (elementParams.bottom >= viewportTop - delta) {
        cutItemIndex = i - 1;
        break;
      }
    }
    if (cutItemIndex >= 0) {
      let firstElementTop = Data.items[0].element.getBoundingClientRect().top;
      let lastElementBottom = Data.items[cutItemIndex].element.getBoundingClientRect().bottom;
      let cutHeight = lastElementBottom - firstElementTop;
      let height = parseInt(Elements.paddingTop.style.height, 10) || 0;
      Elements.paddingTop.style.height = (height + cutHeight) + 'px';
      Data.items.splice(0, cutItemIndex + 1);
      return true;
    }
  }

}

export default Clip
