import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject, ProcessRun } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, payload?: ProcessRun) {
    scroller.state.isInitialCycle = !payload;
    scroller.state.isInitialWorkflowCycle = !payload;
    scroller.state.workflowPending = true;
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.init,
      status: ProcessStatus.next,
      payload: <ProcessRun>{
        scroll: payload && payload.scroll || false,
        keepScroll: false
      }
    });
  }

}
