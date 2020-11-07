import { Scroller } from '../../scroller';
import { ADAPTER_METHODS, validate } from '../../inputs/index';
import { Process, ProcessStatus, AdapterReplaceOptions } from '../../interfaces/index';

export default class Replace {

  static process = Process.replace;

  static run(scroller: Scroller, options: AdapterReplaceOptions) {
    const methodData = validate(options, ADAPTER_METHODS.REPLACE);
    if (!methodData.isValid) {
      scroller.logger.log(() => methodData.showErrors());
      scroller.workflow.call({
        process: Process.replace,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.replace" method call` }
      });
      return;
    }

    scroller.workflow.call({
      process: Process.replace,
      status: ProcessStatus.done
    });
  }

}
