import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { AdapterProcess, ProcessStatus, AdapterReplaceOptions, AdapterInsertOptions } from '../../interfaces/index';
import Remove from './remove';
import Insert from './insert';

export default class Replace extends getBaseAdapterProcess(AdapterProcess.replace) {

  static run(scroller: Scroller, options: AdapterReplaceOptions) {
    const { params } = Replace.parseInput(scroller, options);
    if (!params) {
      return;
    }

    const shouldRemove = Remove.doRemove(scroller, params, true);
    if (!shouldRemove) {
      scroller.logger.log(() => 'no items to replace (not found)');
      return scroller.workflow.call({
        process: Replace.process,
        status: ProcessStatus.done
      });
    }

    const insertOptions: AdapterInsertOptions = {
      items: params.items,
      before: params.predicate,
      decrease: false
    };
    const shouldInsert = Insert.doInsert(scroller, insertOptions);
    if (!shouldInsert) {
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

}
