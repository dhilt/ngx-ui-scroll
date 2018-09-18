import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject, ProcessRun } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, payload?: ProcessRun) {
    scroller.state.process = Process.start;

    scroller.state.startCycle(payload);
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.start,
      status: ProcessStatus.next
    });
  }

}
