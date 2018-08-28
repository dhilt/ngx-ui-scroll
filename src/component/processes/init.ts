import { Scroller } from '../scroller';
import { Process, ProcessSubject, ProcessRun, Direction } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, direction?: Direction) {
    scroller.state.process = Process.init;
    scroller.logger.log(() => {
      const logData = `${scroller.settings.instanceIndex}-${scroller.state.workflowCycleCount}`;
      const logStyles = 'color: #0000aa; border: solid black 1px; border-width: 1px 0 0 1px; margin-left: -2px';
      return [`%c   ~~~ WF Run ${logData} STARTED ~~~  `, logStyles];
    });
    scroller.state.isInitialCycle = !direction;
    scroller.state.isInitialWorkflowCycle = !direction;
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.init,
      status: 'next',
      payload: <ProcessRun>{
        scroll: !!direction,
        direction
      }
    });
  }

}
