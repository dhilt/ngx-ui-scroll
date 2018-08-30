import { Scroller } from '../scroller';
import { Process, ProcessSubject, ProcessRun } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, options?: ProcessRun) {
    scroller.state.process = Process.start;

    const { state } = scroller;
    state.startCycle(options);
    scroller.logger.log(() => {
      const logData = `${scroller.settings.instanceIndex}-${state.workflowCycleCount}-${state.cycleCount}`;
      return [`%c---=== Workflow ${logData} start`, 'color: #006600;'];
    });
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.start,
      status: 'next'
    });
  }

}
