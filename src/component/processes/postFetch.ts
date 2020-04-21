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
    const { buffer, state: { fetch, fetch: { items }, isInitialLoop } } = scroller;
    const first = fetch.firstIndex as number;
    const last = fetch.lastIndex as number;
    if (!items.length) {
      if (last < buffer.minIndex || isInitialLoop) {
        buffer.absMinIndex = buffer.minIndex;
      }
      if (first > buffer.maxIndex || isInitialLoop) {
        buffer.absMaxIndex = buffer.maxIndex;
      }
    } else {
      const lastIndex = items.length - 1;
      if (first < items[0].$index) {
        buffer.absMinIndex = items[0].$index;
      }
      if (last > items[lastIndex].$index) {
        buffer.absMaxIndex = items[lastIndex].$index;
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
    let fetchIndex = fetch.index as number;
    if (items.length < fetch.count) {
      if (scroller.state.isInitialLoop) {
        // let's treat initial poor fetch as startIndex-bof
        fetchIndex = scroller.state.startIndex;
      } else if ((fetch.firstIndex as number) < buffer.minIndex) { // normal bof
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
