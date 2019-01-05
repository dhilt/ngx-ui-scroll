import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, isInitial = false) {
    const { state } = scroller;
    state.isInitialWorkflowCycle = isInitial;
    state.isInitialLoop = isInitial;
    state.workflowPending = true;
    state.isLoading = true;
    scroller.callWorkflow({
      process: Process.init,
      status: ProcessStatus.next
    });
  }

}
