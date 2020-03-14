import { Scroller } from '../scroller';
import { ADAPTER_METHODS_PARAMS, validate } from '../utils/index';
import { Process, ProcessStatus, IDatasourceOptional } from '../interfaces/index';

const { RESET } = ADAPTER_METHODS_PARAMS;

export default class Reset {

  static run(scroller: Scroller, datasource: IDatasourceOptional | null) {
    if (datasource) {
      const methodData = validate(datasource, RESET);
      if (!methodData.isValid) {
        scroller.logger.log(() => methodData.errors.join(', '));
        scroller.workflow.call({
          process: Process.reset,
          status: ProcessStatus.error,
          payload: { error: `Wrong argument of the "Adapter.reset" method call` }
        });
        return;
      }
    } else {
      datasource = scroller.datasource;
    }

    scroller.buffer.reset(true);
    scroller.dispose();

    scroller.workflow.call({
      process: Process.reset,
      status: ProcessStatus.next,
      payload: {
        finalize: scroller.state.isLoading,
        datasource
      }
    });
  }

}
