import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject, Run } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, isScroll?: boolean) {
    scroller.state.isInitial = true;
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.init,
      status: 'next',
      payload: <Run>{
        direction: Direction.forward,
        scroll: !!isScroll
      }
    });
  }
}
