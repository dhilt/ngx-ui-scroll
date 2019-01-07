import { Scroller } from '../scroller';
import { Item } from '../classes/item';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Append {

  static run(scroller: Scroller, payload: { items: any, eof?: any }) {
    let { items, eof } = payload;
    if (!Array.isArray(items)) {
      items = [items];
    }
    if (!items.length) {
      scroller.callWorkflow({
        process: Process.append,
        status: ProcessStatus.error,
        payload: { error: 'Wrong argument of the "append" method call' }
      });
      return;
    }
    eof = !!eof;

    // virtual prepend case: shift abs min index and update viewport params
    if (eof && !scroller.buffer.eof) {
      Append.doVirtualize(scroller, items);
      scroller.callWorkflow({
        process: Process.append,
        status: ProcessStatus.done
      });
      return;
    }

    Append.simulateFetch(scroller, items, eof);
    scroller.callWorkflow({
      process: Process.append,
      status: ProcessStatus.next
    });
  }

  static doVirtualize(scroller: Scroller, items: Array<any>) {
    const { buffer, viewport } = scroller;
    if (isFinite(buffer.absMaxIndex)) {
      buffer.absMaxIndex += items.length;
      const size = items.length * buffer.averageSize;
      viewport.paddings.forward.size += size;
      scroller.logger.log(() => `buffer.absMaxIndex value is set to ${buffer.absMaxIndex}`);
      scroller.logger.stat('after virtual append');
    }
  }

  static simulateFetch(scroller: Scroller, items: Array<any>, eof: boolean): boolean {
    const { buffer, state, state: { fetch } } = scroller;
    let indexToAppend = buffer.getIndexToAppend(eof);
    const newItems = [];

    for (let i = 0; i < items.length; i++) {
      const itemToAppend = new Item(indexToAppend, items[i], scroller.routines);
      if (isFinite(buffer.absMaxIndex) && indexToAppend > buffer.absMaxIndex) {
        buffer.absMaxIndex++;
      }
      newItems.push(itemToAppend);
      indexToAppend++;
    }
    scroller.logger.log(() => `buffer.absMaxIndex value is set to ${scroller.buffer.absMaxIndex}`);

    fetch.append(newItems);
    buffer.append(newItems);
    fetch.firstIndexBuffer = buffer.firstIndex !== null ? buffer.firstIndex : indexToAppend;
    fetch.lastIndexBuffer = buffer.lastIndex !== null ? buffer.lastIndex : indexToAppend;

    state.noClip = true;
    return true;
  }

}
