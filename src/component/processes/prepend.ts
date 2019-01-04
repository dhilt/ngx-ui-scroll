import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';
import { Item } from '../classes/item';

export default class Prepend {

  static run(scroller: Scroller, items: any) {
    if (!Array.isArray(items)) {
      items = [items];
    }
    const { buffer, state, state: { fetch } } = scroller;

    const indexToPrepend = buffer.getIndexToPrepend();
    const itemToPrepend = new Item(indexToPrepend, items[0], scroller.routines);

    // fetch processes simulation
    if (isFinite(buffer.absMinIndex) && indexToPrepend < buffer.absMinIndex) {
      buffer.absMinIndex--;
    }
    fetch.prepend(itemToPrepend);
    buffer.prepend(itemToPrepend);
    fetch.firstIndexBuffer = buffer.firstIndex !== null ? buffer.firstIndex : indexToPrepend;
    fetch.lastIndexBuffer = buffer.lastIndex !== null ? buffer.lastIndex : indexToPrepend;
    state.noClip = true;

    scroller.callWorkflow({
      process: Process.prepend,
      status: ProcessStatus.next
    });
  }

}
