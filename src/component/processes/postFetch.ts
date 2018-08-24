import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';
import { Item } from '../classes/item';

export default class PostFetch {

  static run(scroller: Scroller) {
    scroller.state.process = Process.postFetch;

    if (PostFetch.setItems(scroller)) {
      PostFetch.setBufferLimits(scroller);
      scroller.callWorkflow(<ProcessSubject>{
        process: Process.postFetch,
        status: scroller.state.fetch.hasNewItems ? 'next' : 'done'
      });
    } else {
      scroller.callWorkflow(<ProcessSubject>{
        process: Process.postFetch,
        status: 'error',
        payload: 'Can\'t set buffer items'
      });
    }
  }

  static setBufferLimits(scroller: Scroller) {
    const { buffer } = scroller;
    const { firstIndex, lastIndex, items } = scroller.state.fetch;
    if (!items.length) {
      if (<number>lastIndex < buffer.minIndex) {
        buffer.absMinIndex = buffer.minIndex;
      }
      if (<number>firstIndex > buffer.maxIndex) {
        buffer.absMaxIndex = buffer.maxIndex;
      }
    } else {
      const last = items.length - 1;
      if (<number>firstIndex < items[0].$index) {
        buffer.absMinIndex = items[0].$index;
      }
      if (<number>lastIndex > items[last].$index) {
        buffer.absMaxIndex = items[last].$index;
      }
    }
  }

  static setItems(scroller: Scroller): boolean {
    const buffer = scroller.buffer;
    const fetch = scroller.state.fetch;
    const items = fetch.newItemsData;
    if (!items || !items.length) { // empty result
      return true;
    }
    // eof/bof case, need to shift fetch index if bof
    let fetchIndex = <number>fetch.index;
    if (items.length < fetch.count) {
      // initial poor fetch should be treated as startIndex-bof by default
      if (scroller.state.isInitialCycle) {
        fetchIndex = scroller.state.startIndex;
      } else if (<number>fetch.firstIndex < buffer.minIndex) { // normal bof
        fetchIndex = buffer.minIndex - items.length;
      }
    }
    fetch.items = items.map((item, index: number) =>
      new Item(fetchIndex + index, item, scroller.routines)
    );
    return buffer.setItems(fetch.items);
  }

}
