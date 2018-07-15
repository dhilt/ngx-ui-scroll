import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject } from '../interfaces/index';
import { Item } from '../classes/item';

export default class PostFetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.postFetch;

    if (PostFetch.setItems(scroller)) {
      PostFetch.setEOF(scroller);
      scroller.callWorkflow(<ProcessSubject>{
        process: Process.postFetch,
        status: scroller.state.fetch.hasNewItems ? 'next' : 'done'
      });
    } else {
      scroller.callWorkflow(<ProcessSubject>{
        process: Process.postFetch,
        status: 'error',
        payload: 'Can not set buffer items'
      });
    }
  }

  static setEOF(scroller: Scroller) {
    const { firstIndex, lastIndex, items } = scroller.state.fetch;
    scroller.buffer.bof = <number>firstIndex < items[0].$index;
    scroller.buffer.eof = <number>lastIndex > items[items.length - 1].$index;
  }

  static setItems(scroller: Scroller): boolean {
    const fetch = scroller.state.fetch;
    const items = fetch.newItemsData;
    if (!items || !items.length) { // empty result
      return true;
    }
    fetch.items = items.map((item, index: number) =>
      new Item(<number>fetch.index + index, item, scroller.routines)
    );
    return scroller.buffer.setItems(fetch.items);
  }

}
