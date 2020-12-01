import { getBaseProcess } from './_base';
import { Scroller } from '../scroller';
import { CommonProcess, AdapterProcess, Process, ProcessStatus } from '../interfaces/index';

const initProcesses = [CommonProcess.init, AdapterProcess.reset, AdapterProcess.reload];

export default class Init extends getBaseProcess(CommonProcess.init) {

  static run(scroller: Scroller, process: Process) {
    const { state, workflow, adapter } = scroller;
    const isInitial = initProcesses.includes(process);
    scroller.logger.logCycle(true);
    state.cycle.start(isInitial, process);
    adapter.isLoading = true;
    workflow.call({
      process: Init.process,
      status: ProcessStatus.next
    });
  }

}
