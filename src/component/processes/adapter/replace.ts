import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { AdapterProcess, ProcessStatus, AdapterReplaceOptions } from '../../interfaces/index';

export default class Replace extends getBaseAdapterProcess(AdapterProcess.replace) {

  static run(scroller: Scroller, options: AdapterReplaceOptions) {
    const { params } = Replace.parseInput(scroller, options);
    if (!params) {
      return;
    }

    scroller.workflow.call({
      process: Replace.process,
      status: ProcessStatus.done
    });
  }

}
