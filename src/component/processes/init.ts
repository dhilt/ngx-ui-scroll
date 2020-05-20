import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Init {

  static process = Process.init;

  static run(scroller: Scroller, process?: Process) {
    const { state, workflow, adapter } = scroller;
    const isInitial = !process || process === Process.reset || process === Process.reload;
    scroller.logger.logCycle(true);
    state.isInitialWorkflowCycle = isInitial;
    state.isInitialLoop = isInitial;
    adapter.cyclePending = true;
    adapter.isLoading = true;
    workflow.call({
      process: Process.init,
      status: ProcessStatus.next,
      payload: { process: process || Process.init }
    });
  }

}
