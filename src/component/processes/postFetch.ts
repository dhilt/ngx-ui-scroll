import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';
import { Item } from '../classes/item';

export default class PostFetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.postFetch;

    PostFetch.setEOF(scroller);
    const hasItems = PostFetch.setItems(scroller);
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.postFetch,
      status: hasItems ? 'next' : 'done'
    });
  }

  static setEOF(scroller: Scroller) {
    const direction = scroller.state.direction;
    const fetch = scroller.state.fetch[direction];
    const eof = direction === Direction.forward ? 'eof' : 'bof';
    const items = <Array<Item>>fetch.newItemsData;
    scroller.buffer[eof] = items.length !== scroller.settings.bufferSize;
    if (direction === Direction.backward && scroller.buffer.bof) {
      fetch.startIndex = <number>fetch.startIndex + scroller.settings.bufferSize - items.length;
    }
  }

  static setItems(scroller: Scroller) {
    const direction = scroller.state.direction;
    const fetch = scroller.state.fetch[direction];
    const items = <Array<Item>>fetch.newItemsData;
    if (!items.length) { // empty result
      return false;
    }
    fetch.items = items.map((item, index) => {
      const $index = <number>fetch.startIndex + index;
      const nodeId = String($index);
      return new Item($index, item, nodeId, scroller.routines);
    });
    if (direction === Direction.forward) {
      scroller.buffer.items = [...scroller.buffer.items, ...fetch.items];
    } else {
      scroller.buffer.items = [...fetch.items, ...scroller.buffer.items];
    }
    return true;
  }

}
