import Data from '../data'
import Elements from '../elements'
import Direction from '../direction'

import { Observable } from 'rxjs/Rx'

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
    if (!Data.items.length) {
      return true;
    }
    let lastElement = Data.items[Data.items.length - 1].element;
    let viewportBottom = Elements.viewport.getBoundingClientRect().bottom;
    let lastElementBottom = lastElement.getBoundingClientRect().bottom;
    return lastElementBottom <= viewportBottom;
  }

  static shouldLoadTop() {
    if (self.pendingTop) {
      return false;
    }
    if (!Data.items.length) {
      return true;
    }
    let viewportTop = Elements.viewport.getBoundingClientRect().top;
    let firstElementTop = Data.items[0].element.getBoundingClientRect().top;
    return firstElementTop >= viewportTop;
  }

  static runTop() {
    return Observable.create(observer => {
      if (self.shouldLoadTop()) {
        self.pendingTop = true;
        let start = (Data.items.length ? Data.items[0].$index : Data.startIndex) - Data.bufferSize;
        Data.source.get(start, Data.bufferSize, (result) => {
          self.pendingTop = false;
          Data.bof = result.length !== Data.bufferSize;

          let items = result.map((item, index) => ({
            $index: start + index,
            scope: item,
            invisible: true
          }));
          Data.items = [...items, ...Data.items];

          observer.next(items);
          observer.complete();
        });
      }
      else {
        observer.complete();
      }
    });
  }

  static runBottom() {
    return Observable.create(observer => {
      if (self.shouldLoadBottom()) {
        self.pendingBottom = true;
        let start = Data.items.length ? Data.items[Data.items.length - 1].$index + 1 : Data.startIndex;
        Data.source.get(start, Data.bufferSize, (result) => {
          self.pendingBottom = false;
          Data.eof = result.length !== Data.bufferSize;

          let items = result.map((item, index) => ({
            $index: start + index,
            scope: item,
            invisible: true
          }));
          Data.items = [...Data.items, ...items];

          observer.next(items);
          observer.complete();
        });
      }
      else {
        observer.complete();
      }
    });
  }

}

const self = Fetch;
export default Fetch