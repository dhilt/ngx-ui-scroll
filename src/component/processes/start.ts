import { Scroller } from '../scroller';
import { Process, ProcessRun, ProcessStatus } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, payload?: ProcessRun) {
    scroller.state.startCycle(payload);
    scroller.callWorkflow({
      process: Process.start,
      status: ProcessStatus.next
    });
  }

}
