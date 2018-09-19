import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessRun } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, payload?: ProcessRun) {
    scroller.state.isInitialCycle = !payload;
    scroller.state.isInitialWorkflowCycle = !payload;
    scroller.state.workflowPending = true;
    scroller.callWorkflow({
      process: Process.init,
      status: ProcessStatus.next,
      payload: {
        scroll: payload && payload.scroll || false
      }
    });
  }

}
