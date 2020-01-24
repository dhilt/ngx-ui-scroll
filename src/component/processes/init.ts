import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, process?: Process) {
    const { state, workflow } = scroller;
    const isInitial = !process || process === Process.reload;
    scroller.logger.logCycle(true);
    state.isInitialWorkflowCycle = isInitial;
    state.isInitialLoop = isInitial;
    state.workflowPending = true;
    state.isLoading = true;
    workflow.call({
      process: Process.init,
      status: ProcessStatus.next,
      payload: process || Process.init
    });
  }

}
