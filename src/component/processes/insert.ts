import { Scroller } from '../scroller';
import { ADAPTER_METHODS_PARAMS, validate } from '../utils/index';
import { Item } from '../classes/item';
import {
  Process, ProcessStatus, AdapterInsertOptions, ItemsPredicate, IAdapterValidatedMethodData
} from '../interfaces/index';

const { INSERT } = ADAPTER_METHODS_PARAMS;

export default class Insert {

  static run(scroller: Scroller, options: AdapterInsertOptions) {

    const methodData = validate(options, INSERT);
    if (!methodData.isValid) {
      scroller.logger.log(() => methodData.errors.join(', '));
      scroller.workflow.call({
        process: Process.insert,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.insert" method call` }
      });
      return;
    }

    const next = Insert.doInsert(scroller, methodData);

    scroller.workflow.call({
      process: Process.insert,
      status: next ? ProcessStatus.next : ProcessStatus.done
    });
  }

  static doInsert(scroller: Scroller, methodData: IAdapterValidatedMethodData): boolean {
    const { buffer } = scroller;
    const { before, after, items } = methodData.params;
    const method: ItemsPredicate = (before.isSet ? before.value : after.value);
    const found = buffer.items.find(item => method(item.get()));
    if (!found) {
      return false;
    }
    return Insert.simulateFetch(scroller, found, items.value, before.isSet);
  }

  static simulateFetch(scroller: Scroller, from: Item, items: any[], before: boolean): boolean {
    const { buffer, routines, state: { fetch, clip } } = scroller;
    const bufferLimit = buffer.absMaxIndex;
    const itemsToInsert = items.map((item: any, i: number) =>
      new Item(from.$index + i + 1, item, routines) // todo: need decrement case
    );
    buffer.insertItems(itemsToInsert, from);
    if (bufferLimit !== buffer.absMaxIndex) {
      scroller.logger.log(() =>
        `buffer.absMaxIndex value had been changed from ${bufferLimit} to ${buffer.absMaxIndex}`
      );
    }
    fetch.insert(itemsToInsert);
    fetch.firstIndexBuffer = buffer.firstIndex;
    fetch.lastIndexBuffer = buffer.lastIndex;
    clip.noClip = true;
    return true;
  }

}
