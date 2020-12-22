import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { Item } from '../../classes/item';
import { AdapterProcess, ProcessStatus, AdapterAppendOptions, AdapterPrependOptions } from '../../interfaces/index';

type AdapterAppendPrependOptions = AdapterAppendOptions & AdapterPrependOptions;

export default class Append extends getBaseAdapterProcess(AdapterProcess.append) {

  static run(scroller: Scroller, { prepend, options }: { prepend: boolean, options: AdapterAppendPrependOptions }) {

    const { params } = Append.parseInput(scroller, options);
    if (!params) {
      return;
    }
    const { items, bof, eof } = params;
    const _eof = !!(prepend ? bof : eof);

    // virtual prepend case: shift abs min index and update viewport params
    if (
      (prepend && _eof && !scroller.buffer.bof) ||
      (!prepend && _eof && !scroller.buffer.eof)
    ) {
      Append.doVirtualize(scroller, items, prepend);
      scroller.workflow.call({
        process: Append.process,
        status: ProcessStatus.done
      });
      return;
    }

    Append.simulateFetch(scroller, items, _eof, prepend);

    scroller.workflow.call({
      process: Append.process,
      status: ProcessStatus.next
    });
  }

  static doVirtualize(scroller: Scroller, items: any[], prepend: boolean) {
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

  static simulateFetch(scroller: Scroller, items: any[], eof: boolean, prepend: boolean): boolean {
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
    fetch.first.indexBuffer = !isNaN(buffer.firstIndex) ? buffer.firstIndex : indexToAdd;
    fetch.last.indexBuffer = !isNaN(buffer.lastIndex) ? buffer.lastIndex : indexToAdd;

    state.clip.noClip = true;
    return true;
  }

}
