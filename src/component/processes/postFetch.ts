import { Scroller } from '../scroller';
import { Item } from '../classes/item';
import { Process, ProcessStatus } from '../interfaces/index';

export default class PostFetch {

  static run(scroller: Scroller) {
    const { workflow } = scroller;
    if (PostFetch.setItems(scroller)) {
      PostFetch.setBufferLimits(scroller);
      workflow.call({
        process: Process.postFetch,
        status: scroller.state.fetch.hasNewItems
          ? ProcessStatus.next
          : ProcessStatus.done
      });
    } else {
      workflow.call({
        process: Process.postFetch,
        status: ProcessStatus.error,
        payload: { error: `Can't set buffer items` }
      });
    }
  }

  static setBufferLimits(scroller: Scroller) {
    const { buffer, state: { fetch: { firstIndex, lastIndex, items }, isInitialLoop } } = scroller;
    if (!items.length) {
      if (<number>lastIndex < buffer.minIndex || isInitialLoop) {
        buffer.absMinIndex = buffer.minIndex;
      }
      if (<number>firstIndex > buffer.maxIndex || isInitialLoop) {
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
    const { buffer, state: { fetch } } = scroller;
    const items = fetch.newItemsData;
    if (!items || !items.length) { // empty result
      return true;
    }
    // eof/bof case, need to shift fetch index if bof
    let fetchIndex = <number>fetch.index;
    if (items.length < fetch.count) {
      if (scroller.state.isInitialLoop) {
        // let's treat initial poor fetch as startIndex-bof
        fetchIndex = scroller.state.startIndex;
      } else if (<number>fetch.firstIndex < buffer.minIndex) { // normal bof
        fetchIndex = buffer.minIndex - items.length;
      }
    }
    fetch.items = items.map((item, index: number) =>
      new Item(fetchIndex + index, item, scroller.routines)
    );
    fetch.isPrepend = !!buffer.items.length && buffer.items[0].$index > fetch.items[fetch.items.length - 1].$index;
    return buffer.setItems(fetch.items);
  }

}
