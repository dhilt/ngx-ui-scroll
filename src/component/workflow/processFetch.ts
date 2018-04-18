import { Scroller } from '../scroller';
import { Direction } from '../interfaces/index';
import { Item } from '../classes/item';

export default class ProcessFetch {

  static run(scroller: Scroller) {
    ProcessFetch.runByDirection(scroller, scroller.state.direction);
    return scroller;
  }

  static runByDirection(scroller: Scroller, direction: Direction) {
    const fetch = scroller.state.fetch[direction];
    if (!fetch.newItemsData) { // no fetch
      return;
    }

    const eof = direction === Direction.forward ? 'eof' : 'bof';
    scroller.buffer[eof] = fetch.newItemsData.length !== scroller.settings.bufferSize;
    if (direction === Direction.backward && scroller.buffer.bof) {
      fetch.startIndex += scroller.settings.bufferSize - fetch.newItemsData.length;
    }

    if (!fetch.newItemsData.length) { // empty result
      return;
    }
    fetch.items = fetch.newItemsData.map((item, index) => {
      const $index = fetch.startIndex + index;
      const nodeId = scroller.settings.itemIdPrefix + String($index);
      return new Item($index, item, nodeId, scroller.routines);
    });

    if (direction === Direction.forward) {
      scroller.buffer.items = [...scroller.buffer.items, ...fetch.items];
    } else {
      scroller.buffer.items = [...fetch.items, ...scroller.buffer.items];
    }
  }

}
