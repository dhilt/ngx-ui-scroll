import { Scroller } from '../scroller';
import { ADAPTER_METHODS_PARAMS, validate } from '../utils/index';
import { Process, ProcessStatus, AdapterInsertOptions } from '../interfaces/index';

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

    console.log(methodData.params);

    scroller.workflow.call({
      process: Process.insert,
      status: ProcessStatus.next
    });
  }

}
