import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import Remove from './remove';
import Insert from './insert';
import {
  AdapterProcess, ProcessStatus, AdapterReplaceOptions, AdapterInsertOptions, AdapterRemoveOptions
} from '../../interfaces/index';

export default class Replace extends getBaseAdapterProcess(AdapterProcess.replace) {

  static run(scroller: Scroller, options: AdapterReplaceOptions) {
    const { params } = Replace.parseInput(scroller, options);
    if (!params) {
      return;
    }

    if (!Replace.doRemove(scroller, params)) {
      scroller.logger.log(() => 'no items to replace (not found)');
      return scroller.workflow.call({
        process: Replace.process,
        status: ProcessStatus.done
      });
    }

    if (!Replace.doInsert(scroller, params)) {
      return scroller.workflow.call({
        process: Replace.process,
        status: ProcessStatus.done
      });
    }

    scroller.workflow.call({
      process: Replace.process,
      status: ProcessStatus.next
    });
  }

  static doRemove(scroller: Scroller, params: AdapterReplaceOptions) {
    const removeOptions: AdapterRemoveOptions = {
      predicate: params.predicate,
      increase: params.fixRight
    };
    return Remove.doRemove(scroller, removeOptions, true);
  }

  static doInsert(scroller: Scroller, params: AdapterReplaceOptions) {
    const insertOptions: AdapterInsertOptions = {
      items: params.items,
      after: params.predicate,
      decrease: params.fixRight
    };
    return Insert.doInsert(scroller, insertOptions);
  }

}
