import { Scroller } from '../scroller';
import { Datasource } from '../classes/datasource';
import { checkDatasource } from '../utils';
import { Process, ProcessStatus, IDatasource } from '../interfaces/index';

export default class Reset {

  static run(scroller: Scroller, datasource: IDatasource | Datasource | null) {
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
