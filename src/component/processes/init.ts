import { Scroller } from '../scroller';
import { Process, ProcessSubject, ProcessRun } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, isScroll?: boolean) {
    scroller.logger.log(() => {
      const logData = `${scroller.settings.instanceIndex}-${scroller.state.workflowCycleCount}`;
      const logStyles = 'color: #0000aa; border: solid black 1px; border-width: 1px 0 0 1px; margin-left: -2px';
      return [`%c   ~~~ WF Run ${logData} STARTED ~~~  `, logStyles];
    });
    scroller.state.isInitialCycle = !isScroll;
    scroller.state.isInitialWorkflowCycle = !isScroll;
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.init,
      status: 'next',
      payload: <ProcessRun>{
        scroll: !!isScroll
      }
    });
  }
}
