import { getBaseAdapterProcess } from './_base';
import { Scroller } from '../../scroller';
import { ADAPTER_METHODS } from '../../inputs/index';
import { Datasource } from '../../classes/datasource';
import { AdapterProcess, ProcessStatus, IDatasourceOptional } from '../../interfaces/index';

export default class Reset extends getBaseAdapterProcess(AdapterProcess.reset) {

  static run(scroller: Scroller, options?: IDatasourceOptional) {
    const { datasource, buffer, viewport: { paddings }, state: { cycle } } = scroller;

    if (options) {
      const { data } = Reset.parseInput(scroller, options);
      if (!data.isValid) {
        return;
      }
      const constructed = options instanceof Datasource;
      Object.keys(ADAPTER_METHODS[Reset.process]).forEach(key => {
        const param = data.params[key];
        if (param.isSet || (constructed && datasource.hasOwnProperty(key))) {
          (datasource as any)[key] = param.value;
        }
      });
    }

    buffer.reset(true);
    paddings.backward.reset();
    paddings.forward.reset();

    const payload: any = { datasource };
    if (cycle.busy.get()) {
      payload.finalize = true;
      cycle.interrupter = Reset.process;
    }

    scroller.workflow.call({
      process: Reset.process,
      status: ProcessStatus.next,
      payload
    });
  }

}
