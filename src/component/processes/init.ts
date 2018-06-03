import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject, Run } from '../interfaces/index';

export default class Init {

  static run(scroller: Scroller, cyclesDone: number, isScroll?: boolean) {
    const logData = `${scroller.settings.instanceIndex}-${cyclesDone + 1}`;
    const logStyles = 'color: #0000aa; border: solid black 1px; border-width: 1px 0 0 1px; margin-left: -2px';
    scroller.log(`%c   ~~~ WF Run ${logData} STARTED ~~~  `, logStyles);
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
