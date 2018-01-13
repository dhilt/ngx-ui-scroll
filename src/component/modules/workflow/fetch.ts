import Data from '../data';
import Elements from '../elements';
import Direction from '../direction';

class Fetch {

  static pendingTop = false;
  static pendingBottom = false;

  static run(direction) {
    if (direction === Direction.top) {
      return self.runTop();
    }
    if (direction === Direction.bottom) {
      return self.runBottom();
    }
  }

  static shouldLoadBottom() {
    if (self.pendingBottom) {
      return false;
    }
    const lastItem = Data.getLastVisibleItem();
    if (!lastItem) {
      return true;
    }
    const viewportBottom = Elements.viewport.getBoundingClientRect().bottom;
    const lastElementBottom = lastItem.element.getBoundingClientRect().bottom;
    return lastElementBottom <= viewportBottom;
  }

  static shouldLoadTop() {
    if (self.pendingTop) {
      return false;
    }
    const firstItem = Data.getFirstVisibleItem();
    if (!firstItem) {
      return true;
    }
    const viewportTop = Elements.viewport.getBoundingClientRect().top;
    const firstElementTop = firstItem.element.getBoundingClientRect().top;
    return firstElementTop >= viewportTop;
  }

  static runTop() {
    return new Promise((resolve, reject) => {
      if (self.shouldLoadTop()) {
        self.pendingTop = true;
        const start = (Data.items.length ?
            Data.items[0].$index :
            (Data.lastIndex !== null ? Data.lastIndex : Data.startIndex))
          - Data.bufferSize;
        Data.source.get(start, Data.bufferSize).subscribe((result) => {
          self.pendingTop = false;
          Data.bof = result.length !== Data.bufferSize;

          const items = result.map((item, index) => ({
            $index: start + index,
            scope: item,
            invisible: true
          }));
          Data.items = [...items, ...Data.items];

          resolve(items);
        });
      } else {
        reject();
      }
    });
  }

  static runBottom() {
    return new Promise((resolve, reject) => {
      if (self.shouldLoadBottom()) {
        self.pendingBottom = true;
        const start = Data.items.length ?
        Data.items[Data.items.length - 1].$index + 1 :
          (Data.lastIndex !== null ? Data.lastIndex + 1 : Data.startIndex);

        Data.source.get(start, Data.bufferSize).subscribe((result) => {
          self.pendingBottom = false;
          Data.eof = result.length !== Data.bufferSize;

          const items = result.map((item, index) => ({
            $index: start + index,
            scope: item,
            invisible: true
          }));
          Data.items = [...Data.items, ...items];

          resolve(items);
        });
      } else {
        reject();
      }
    });
  }

}

const self = Fetch;
export default Fetch;
