import { getBaseProcess } from './_base';
import { Scroller } from '../scroller';
import { Item } from '../classes/item';
import { CommonProcess, ProcessStatus } from '../interfaces/index';

export default class PostFetch extends getBaseProcess(CommonProcess.postFetch) {

  static run(scroller: Scroller) {
    const { workflow } = scroller;
    if (PostFetch.setItems(scroller)) {
      PostFetch.setBufferLimits(scroller);
      workflow.call({
        process: PostFetch.process,
        status: scroller.state.fetch.hasNewItems
          ? ProcessStatus.next
          : ProcessStatus.done
      });
    } else {
      workflow.call({
        process: PostFetch.process,
        status: ProcessStatus.error,
        payload: { error: `Can't set buffer items` }
      });
    }
  }

  static setBufferLimits(scroller: Scroller) {
    const { buffer, state: { fetch, fetch: { items }, cycle: { innerLoop } } } = scroller;
    const first = fetch.first.index as number;
    const last = fetch.last.index as number;
    if (!items.length) {
      if (last < buffer.minIndex || innerLoop.isInitial) {
        buffer.absMinIndex = buffer.minIndex;
      }
      if (first > buffer.maxIndex || innerLoop.isInitial) {
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
    const { buffer, state: { fetch, cycle } } = scroller;
    const items = fetch.newItemsData;
    if (!items || !items.length) { // empty result
      return true;
    }
    // eof/bof case, need to shift fetch index if bof
    let fetchIndex = fetch.index as number;
    if (items.length < fetch.count) {
      if (cycle.innerLoop.isInitial) {
        // let's treat initial poor fetch as startIndex-bof
        fetchIndex = scroller.state.startIndex;
      } else if ((fetch.first.index as number) < buffer.minIndex) { // normal bof
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
