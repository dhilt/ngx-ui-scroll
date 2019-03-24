import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, process?: Process) {
    const { state } = scroller;
    const isInitial = !process || process === Process.reload;
    state.isInitialWorkflowCycle = isInitial;
    state.isInitialLoop = isInitial;
    state.workflowPending = true;
    state.isLoading = true;
    scroller.callWorkflow({
      process: Process.init,
      status: ProcessStatus.next,
      payload: process || Process.init
    });
  }

}
