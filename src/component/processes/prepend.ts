import { Scroller } from '../scroller';
import { Item } from '../classes/item';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Prepend {

  static run(scroller: Scroller, items: any) {
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

    Prepend.simulateFetch(scroller, items);

    scroller.callWorkflow({
      process: Process.prepend,
      status: ProcessStatus.next
    });
  }

  static simulateFetch(scroller: Scroller, items: any) {
    const { buffer, state, state: { fetch } } = scroller;
    const newItems = [];
    let indexToPrepend = buffer.getIndexToPrepend();

    for (let i = 0; i < items.length; i++) {
      const itemToPrepend = new Item(indexToPrepend, items[i], scroller.routines);
      if (isFinite(buffer.absMinIndex) && indexToPrepend < buffer.absMinIndex) {
        buffer.absMinIndex--;
      }
      newItems.unshift(itemToPrepend);
      indexToPrepend--;
    }

    fetch.prepend(newItems);
    buffer.prepend(newItems);

    fetch.firstIndexBuffer = buffer.firstIndex !== null ? buffer.firstIndex : indexToPrepend;
    fetch.lastIndexBuffer = buffer.lastIndex !== null ? buffer.lastIndex : indexToPrepend;

    state.noClip = true;
  }

}
