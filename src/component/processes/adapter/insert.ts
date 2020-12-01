import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { Item } from '../../classes/item';
import {
  AdapterProcess, ProcessStatus, AdapterInsertOptions, ItemsPredicate, IValidatedData
} from '../../interfaces/index';

export default class Insert extends getBaseAdapterProcess(AdapterProcess.insert) {

  static run(scroller: Scroller, options: AdapterInsertOptions) {

    const { data } = Insert.parseInput(scroller, options);
    if (!data.isValid) {
      return;
    }

    const next = Insert.doInsert(scroller, data);

    scroller.workflow.call({
      process: Insert.process,
      status: next ? ProcessStatus.next : ProcessStatus.done
    });
  }

  static doInsert(scroller: Scroller, { params }: IValidatedData): boolean {
    const { buffer } = scroller;
    const { before, after, items, decrease } = params;
    const method: ItemsPredicate = before.isSet ? before.value : after.value;
    const found = buffer.items.find(item => method(item.get()));
    if (!found) {
      return false;
    }
    const decrement = decrease.isSet && decrease.value;
    return Insert.simulateFetch(scroller, found, items.value, before.isSet, decrement);
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
    buffer.insertItems(itemsToInsert, from, addition, decrement);
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
