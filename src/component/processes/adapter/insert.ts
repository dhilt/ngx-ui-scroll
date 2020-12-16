import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { Item } from '../../classes/item';
import {
  AdapterProcess, ProcessStatus, AdapterInsertOptions, ItemsPredicate
} from '../../interfaces/index';

export default class Insert extends getBaseAdapterProcess(AdapterProcess.insert) {

  static run(scroller: Scroller, options: AdapterInsertOptions) {

    const { params } = Insert.parseInput(scroller, options);
    if (!params) {
      return;
    }

    const shouldInsert = Insert.doInsert(scroller, params);

    scroller.workflow.call({
      process: Insert.process,
      status: shouldInsert ? ProcessStatus.next : ProcessStatus.done
    });
  }

  static doInsert(scroller: Scroller, params: AdapterInsertOptions): boolean {
    const { before, after, items, decrease } = params;
    const method = (before || after) as ItemsPredicate;
    const found = scroller.buffer.items.find(item => method(item.get()));
    if (!found) {
      return false;
    }
    return Insert.simulateFetch(scroller, found, items, !!before, !!decrease);
  }

  static simulateFetch(
    scroller: Scroller, from: Item, items: any[], before: boolean, decrement: boolean
  ): boolean {
    const { buffer, routines, state: { fetch, clip } } = scroller;
    const bufferLimit = decrement ? buffer.absMinIndex : buffer.absMaxIndex;
    const addition = before ? 0 : 1;
    const count = items.length;
    const itemsToInsert = items.map((item: any, i: number) =>
      new Item(from.$index + i + addition - (decrement ? count : 0), item, routines)
    );
    buffer.insertItems(itemsToInsert, from, addition, !decrement);
    scroller.logger.log(() => {
      const newBufferLimit = decrement ? buffer.absMinIndex : buffer.absMaxIndex;
      const isChange = bufferLimit !== newBufferLimit;
      const token = decrement ? 'absMinIndex' : 'absMaxIndex';
      return `buffer.${token} value ` + (
        isChange ? `has been changed from ${bufferLimit} to ${newBufferLimit}` : `has not been changed`
      );
    });
    fetch.insert(itemsToInsert);
    fetch.first.indexBuffer = buffer.firstIndex;
    fetch.last.indexBuffer = buffer.lastIndex;
    clip.noClip = true;
    return true;
  }

}
