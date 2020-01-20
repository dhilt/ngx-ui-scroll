import { Scroller } from '../scroller';
import { Item } from '../classes/item';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Append {

  static run(scroller: Scroller, payload: { items: any, eof?: any, bof?: any, prepend?: any }) {
    const { workflow } = scroller;
    let { items } = payload;
    items = !Array.isArray(items) ? [items] : items;
    const prepend = !!payload.prepend;
    const eof = !!(prepend ? payload.bof : payload.eof);
    const process = prepend ? Process.prepend : Process.append;

    if (!items.length) {
      workflow.call({
        process,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "${prepend ? 'prepend' : 'append'}" method call` }
      });
      return;
    }

    // virtual prepend case: shift abs min index and update viewport params
    if (
      (prepend && eof && !scroller.buffer.bof) ||
      (!prepend && eof && !scroller.buffer.eof)
    ) {
      Append.doVirtualize(scroller, items, prepend);
      workflow.call({
        process,
        status: ProcessStatus.done
      });
      return;
    }

    Append.simulateFetch(scroller, items, eof, prepend);
    workflow.call({
      process,
      status: ProcessStatus.next
    });
  }

  static doVirtualize(scroller: Scroller, items: Array<any>, prepend: boolean) {
    const { buffer, viewport: { paddings } } = scroller;
    const bufferToken = prepend ? 'absMinIndex' : 'absMaxIndex';
    if (isFinite(buffer[bufferToken])) {
      const size = items.length * buffer.averageSize;
      const padding = prepend ? paddings.backward : paddings.forward;
      buffer[bufferToken] += (prepend ? -1 : 1) * items.length;
      padding.size += size;
      if (prepend) {
        scroller.viewport.scrollPosition += size;
      }
      scroller.logger.log(() => `buffer.${[bufferToken]} value is set to ${buffer[bufferToken]}`);
      scroller.logger.stat(`after virtual ${prepend ? 'prepend' : 'append'}`);
    }
  }

  static simulateFetch(scroller: Scroller, items: Array<any>, eof: boolean, prepend: boolean): boolean {
    const { buffer, state, state: { fetch } } = scroller;
    const bufferToken = prepend ? 'absMinIndex' : 'absMaxIndex';
    let indexToAdd = buffer.getIndexToAdd(eof, prepend);
    let bufferLimit = buffer[bufferToken];
    const newItems: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const itemToAdd = new Item(indexToAdd, items[i], scroller.routines);
      if (isFinite(bufferLimit) && (
        (prepend && indexToAdd < bufferLimit) ||
        (!prepend && indexToAdd > bufferLimit)
      )) {
        bufferLimit += (prepend ? -1 : 1);
      }
      (prepend ? Array.prototype.unshift : Array.prototype.push).apply(newItems, [itemToAdd]);
      // (prepend ? newItems.unshift : newItems.push)(itemToAdd);
      indexToAdd += (prepend ? -1 : 1);
    }

    if (bufferLimit !== buffer[bufferToken]) {
      buffer[bufferToken] = bufferLimit;
      scroller.logger.log(() => `buffer.${bufferToken} value is set to ${buffer[bufferToken]}`);
    }

    (prepend ? fetch.prepend : fetch.append).call(fetch, newItems);
    (prepend ? buffer.prepend : buffer.append).call(buffer, newItems);
    fetch.firstIndexBuffer = buffer.firstIndex !== null ? buffer.firstIndex : indexToAdd;
    fetch.lastIndexBuffer = buffer.lastIndex !== null ? buffer.lastIndex : indexToAdd;

    state.clip.noClip = true;
    return true;
  }

}
