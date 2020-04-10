import { Scroller } from '../scroller';
import { ADAPTER_METHODS, validate } from '../inputs/index';
import { Process, ProcessStatus, IDatasource, IDatasourceOptional } from '../interfaces/index';
import { Datasource } from '../classes/datasource';

const { RESET } = ADAPTER_METHODS;

export default class Reset {

  static run(scroller: Scroller, params: IDatasourceOptional | null) {
    const { datasource, buffer, viewport: { paddings } } = scroller;

    if (params) {
      const methodData = validate(params, RESET);
      if (!methodData.isValid) {
        scroller.logger.log(() => methodData.showErrors());
        scroller.workflow.call({
          process: Process.reset,
          status: ProcessStatus.error,
          payload: { error: `Wrong argument of the "Adapter.reset" method call` }
        });
        return;
      }
      const constructed = params instanceof Datasource;
      Object.keys(RESET).forEach(key => {
        const param = methodData.params[key];
        if (param.isSet || (constructed && datasource.hasOwnProperty(key))) {
          (datasource as any)[key] = param.value;
        }
      });
    }

    buffer.reset(true);
    paddings.backward.reset();
    paddings.forward.reset();

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
