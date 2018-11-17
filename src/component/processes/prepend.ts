import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';
import { Item } from '../classes/item';

export default class Prepend {

  static run(scroller: Scroller, item: any) {
    const { buffer, state, state: { fetch } } = scroller;

    const indexToPrepend = buffer.getIndexToPrepend();
    const itemToPrepend = new Item(indexToPrepend, item, scroller.routines);

    // fetch processes simulation
    if (isFinite(buffer.absMinIndex) && indexToPrepend < buffer.absMinIndex) {
      buffer.absMinIndex--;
    }
    state.canClip = false;
    fetch.prepend(itemToPrepend);
    buffer.prepend(itemToPrepend);
    fetch.firstIndexBuffer = buffer.firstIndex !== null ? buffer.firstIndex : indexToPrepend;
    fetch.lastIndexBuffer = buffer.lastIndex !== null ? buffer.lastIndex : indexToPrepend;

    scroller.callWorkflow({
      process: Process.prepend,
      status: ProcessStatus.next
    });
  }

}
