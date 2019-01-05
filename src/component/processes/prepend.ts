import { Scroller } from '../scroller';
import { Item } from '../classes/item';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Prepend {

  static run(scroller: Scroller, payload: { items: any, bof?: any }) {
    let { items, bof } = payload;
    if (!Array.isArray(items)) {
      items = [items];
    }
    if (!items.length) {
      scroller.callWorkflow({
        process: Process.prepend,
        status: ProcessStatus.error,
        payload: { error: 'Wrong argument of the "prepend" method call' }
      });
      return;
    }
    bof = !!bof;

    const next = Prepend.simulateFetch(scroller, items, bof);
    scroller.logger.log(() => `buffer.absMinIndex value is set to ${scroller.buffer.absMinIndex}`);

    scroller.callWorkflow({
      process: Process.prepend,
      status: next ? ProcessStatus.next : ProcessStatus.done
    });
  }

  static simulateFetch(scroller: Scroller, items: Array<any>, bof: boolean): boolean {
    const { buffer, state, state: { fetch } } = scroller;
    let indexToPrepend = buffer.getIndexToPrepend(bof);

    // virtual prepend case
    if (bof && !buffer.bof) {
      for (let i = 0; i < items.length; i++) {
        if (isFinite(buffer.absMinIndex) && indexToPrepend-- < buffer.absMinIndex) {
          buffer.absMinIndex--;
        }
      }
      return false;
    }

    const newItems = [];
    for (let i = 0; i < items.length; i++) {
      const itemToPrepend = new Item(indexToPrepend, items[i], scroller.routines);
      if (isFinite(buffer.absMinIndex) && indexToPrepend-- < buffer.absMinIndex) {
        buffer.absMinIndex--;
      }
      newItems.unshift(itemToPrepend);
    }

    fetch.prepend(newItems);
    buffer.prepend(newItems);
    fetch.firstIndexBuffer = buffer.firstIndex !== null ? buffer.firstIndex : indexToPrepend;
    fetch.lastIndexBuffer = buffer.lastIndex !== null ? buffer.lastIndex : indexToPrepend;

    state.noClip = true;
    return true;
  }

}
