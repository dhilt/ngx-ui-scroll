import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { AdapterProcess, ProcessStatus, AdapterReplaceOptions } from '../../interfaces/index';
import Remove from './remove';

export default class Replace extends getBaseAdapterProcess(AdapterProcess.replace) {

  static run(scroller: Scroller, options: AdapterReplaceOptions) {
    const { params } = Replace.parseInput(scroller, options);
    if (!params) {
      return;
    }

    const shouldRemove = Remove.removeItems(scroller, params, true);
    if (!shouldRemove) {
      scroller.logger.log(() => 'no items to replace (not found)');
      return scroller.workflow.call({
        process: Replace.process,
        status: ProcessStatus.done
      });
    }

    scroller.workflow.call({
      process: Replace.process,
      status: ProcessStatus.done
    });
  }

}
