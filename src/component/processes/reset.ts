import { Scroller } from '../scroller';
import { ADAPTER_METHODS_PARAMS, validate } from '../utils/index';
import { Process, ProcessStatus, IDatasource, IDatasourceOptional } from '../interfaces/index';
import { Datasource } from '../classes/datasource';

const { RESET } = ADAPTER_METHODS_PARAMS;

export default class Reset {

  static run(scroller: Scroller, params: IDatasourceOptional | null) {
    let datasource = scroller.datasource;
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
      if (params instanceof Datasource) {
        datasource = params;
      } else {
        if (get.isSet) {
          datasource.get = get.value;
        }
        if (settings.isSet) {
          datasource.settings = settings.value;
        }
        if (devSettings.isSet) {
          datasource.devSettings = devSettings.value;
        }
      }
    }

    scroller.buffer.reset(true);
    scroller.viewport.paddings.backward.reset();
    scroller.viewport.paddings.forward.reset();

    scroller.workflow.call({
      process: Process.reset,
      status: ProcessStatus.next,
      payload: {
        finalize: scroller.adapter.isLoading,
        datasource
      }
    });
  }

}
