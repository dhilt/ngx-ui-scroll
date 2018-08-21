import { Scroller } from '../scroller';
import { Process, ProcessSubject, ProcessRun } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, options: ProcessRun = {}) {
    scroller.state.startCycle(options);
    const logData = `${scroller.settings.instanceIndex}-${scroller.state.wfCycleCount}-${scroller.state.cycleCount}`;
    scroller.logger.log(`%c---=== Workflow ${logData} start`, 'color: #006600;', options);
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.start,
      status: 'next'
    });
  }
}
