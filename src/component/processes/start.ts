import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject } from '../interfaces/index';

export default class Start {

  static run(scroller: Scroller, payload?: any) {
    scroller.state.startCycle(payload);
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.start,
      status: ProcessStatus.next
    });
  }

}
