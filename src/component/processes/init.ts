import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

const initProcesses = [Process.init, Process.reset, Process.reload];

export default class Init {

  static process = Process.init;

  static run(scroller: Scroller, process: Process) {
    const { state, workflow, adapter } = scroller;
    const isInitial = initProcesses.includes(process);
    scroller.logger.logCycle(true);
    state.cycle.isInitial = isInitial;
    state.cycle.innerLoop.isInitial = isInitial;
    adapter.isLoading = true;
    workflow.call({
      process: Process.init,
      status: ProcessStatus.next,
      payload: { process }
    });
  }

}
