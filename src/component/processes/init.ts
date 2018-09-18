import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject, ProcessRun, Direction } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, payload?: ProcessRun) {
    scroller.state.process = Process.init;
    scroller.state.isInitialCycle = !payload;
    scroller.state.isInitialWorkflowCycle = !payload;
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.init,
      status: ProcessStatus.next,
      payload: <ProcessRun>{
        scroll: payload && payload.scroll || false,
        direction: payload && payload.direction || Direction.forward
      }
    });
  }

}
