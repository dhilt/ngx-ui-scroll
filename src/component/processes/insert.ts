import { Scroller } from '../scroller';
import {
  Process,
  ProcessStatus,
  ItemsLooper,
  AdapterInsertOptions,
  IAdapterMethodParam as IParam,
  ValidatorType
} from '../interfaces/index';

export default class Insert {

  static run(scroller: Scroller, options: AdapterInsertOptions) {
    if (!Insert.checkOptions(options)) {
      scroller.workflow.call({
        process: Process.insert,
        status: ProcessStatus.error,
        payload: { error: `Wrong argument of the "Adapter.insert" method call` }
      });
      return;
    }

    scroller.workflow.call({
      process: Process.insert,
      status: ProcessStatus.next
    });
  }

  static checkOptions(options: AdapterInsertOptions): string[] {
    if (!options || typeof options !== 'object') {
      return ['argument is not an object'];
    }

    return [];
  }

}
