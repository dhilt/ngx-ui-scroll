import { Scroller } from '../scroller';
import { ADAPTER_METHODS_PARAMS, validate } from '../utils/index';
import { Process, ProcessStatus, IDatasource, IDatasourceOptional } from '../interfaces/index';

const { RESET } = ADAPTER_METHODS_PARAMS;

export default class Reset {

  static run(scroller: Scroller, params: IDatasourceOptional | null) {
    let datasource: IDatasource;
    if (params) {
      const methodData = validate(params, RESET);
      if (!methodData.isValid) {
        scroller.logger.log(() => methodData.errors.join(', '));
        scroller.workflow.call({
          process: Process.reset,
          status: ProcessStatus.error,
          payload: { error: `Wrong argument of the "Adapter.reset" method call` }
        });
        return;
      }
      const { get, settings, devSettings } = methodData.params;
      if (get.isSet) {
        datasource = params as IDatasource;
      } else {
        datasource = scroller.datasource;
        if (settings.isSet) {
          datasource.settings = settings.value;
        }
        if (devSettings.isSet) {
          datasource.devSettings = devSettings.value;
        }
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
