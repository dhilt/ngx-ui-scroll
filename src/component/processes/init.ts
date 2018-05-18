import { Scroller } from '../scroller';
import { Process, ProcessSubject } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller) {
    scroller.state.isInitial = true;
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.init,
      status: 'next'
    });
  }
}
