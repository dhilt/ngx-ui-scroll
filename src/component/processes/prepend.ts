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

    // virtual prepend case: shift abs min index and update viewport params
    if (bof && !scroller.buffer.bof) {
      Prepend.doVirtualize(scroller, items);
      scroller.callWorkflow({
        process: Process.prepend,
        status: ProcessStatus.done
      });
      return;
    }

    Prepend.simulateFetch(scroller, items, bof);
    scroller.callWorkflow({
      process: Process.prepend,
      status: ProcessStatus.next
    });
  }

  static doVirtualize(scroller: Scroller, items: Array<any>) {
    const { buffer, viewport } = scroller;
    if (isFinite(buffer.absMinIndex)) {
      buffer.absMinIndex -= items.length;
      const size = items.length * buffer.averageSize;
      viewport.paddings.backward.size += size;
      viewport.scrollPosition += size;
      scroller.logger.log(() => `buffer.absMinIndex value is set to ${buffer.absMinIndex}`);
      scroller.logger.stat('after virtual prepend');
    }
  }

  static simulateFetch(scroller: Scroller, items: Array<any>, bof: boolean): boolean {
    const { buffer, state, state: { fetch } } = scroller;
    let indexToPrepend = buffer.getIndexToPrepend(bof);
    const newItems = [];

    for (let i = 0; i < items.length; i++) {
      const itemToPrepend = new Item(indexToPrepend, items[i], scroller.routines);
      if (isFinite(buffer.absMinIndex) && indexToPrepend < buffer.absMinIndex) {
        buffer.absMinIndex--;
      }
      newItems.unshift(itemToPrepend);
      indexToPrepend--;
    }
    scroller.logger.log(() => `buffer.absMinIndex value is set to ${scroller.buffer.absMinIndex}`);

    fetch.prepend(newItems);
    buffer.prepend(newItems);
    fetch.firstIndexBuffer = buffer.firstIndex !== null ? buffer.firstIndex : indexToPrepend;
    fetch.lastIndexBuffer = buffer.lastIndex !== null ? buffer.lastIndex : indexToPrepend;

    state.noClip = true;
    return true;
  }

}
