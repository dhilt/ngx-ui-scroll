import { Scroller } from '../scroller';
import { Process, ProcessStatus } from '../interfaces/index';

export default class Check {

  static run(scroller: Scroller) {

    scroller.callWorkflow({
      process: Process.check,
      status: ProcessStatus.next
    });
  }

}
