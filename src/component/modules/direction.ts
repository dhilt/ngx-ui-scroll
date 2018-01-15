import Elements from './elements';
import Data from './data';

class Direction {
  static top = 'top';
  static bottom = 'bottom';

  static opposite(direction: string) {
    if (direction === self.top) {
      return self.bottom;
    }
    if (direction === self.bottom) {
      return self.top;
    }
    return null;
  }

  static byScrollTop() {
    if (Data.position < Elements.viewport.scrollTop) {
      return self.bottom;
    }
    if (Data.position > Elements.viewport.scrollTop) {
      return self.top;
    }
    return null;
  }

  static isValid(value) {
    return value === self.top || value === self.bottom;
  }
}

const self = Direction;
export default Direction;
