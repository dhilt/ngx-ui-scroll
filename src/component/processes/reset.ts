import { Scroller } from '../scroller';
import { checkDatasource } from '../utils/index';
import { Process, ProcessStatus, IDatasourceOptional } from '../interfaces/index';

export default class Reset {

  static run(scroller: Scroller, datasource: IDatasourceOptional | null) {
    if (datasource) {
      try {
        checkDatasource(datasource);
      } catch ({ message }) {
        scroller.workflow.call({
          process: Process.reset,
          status: ProcessStatus.error,
          payload: { error: message }
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
