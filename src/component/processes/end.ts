import { Scroller } from '../scroller';
import { Process, ProcessSubject, Run } from '../interfaces/index';

export default class End {

  static run(scroller: Scroller, isFail?: boolean) {
    scroller.state.endCycle();
    scroller.purgeCycleSubscriptions();
    scroller.finalize();

    let next: Run | null = null;
    const logData = `${scroller.settings.instanceIndex}-${scroller.state.wfCycleCount}-${scroller.state.cycleCount}`;
    if (isFail) {
      scroller.log(`%c---=== Workflow ${logData} fail`, 'color: #006600;');
    } else {
      scroller.log(`%c---=== Workflow ${logData} done`, 'color: #006600;');
      next = End.getNextRun(scroller);
    }

    scroller.callWorkflow(<ProcessSubject>{
      process: Process.end,
      status: next ? 'next' : 'done',
      payload: next
    });
  }

  static getNextRun(scroller: Scroller): Run | null {
    let nextRun: Run | null = null;
    if (scroller.state.fetch.hasNewItems || scroller.state.clip.shouldClip) {
      nextRun = {
        scroll: scroller.state.scroll
      };
    }
    return nextRun;
  }
}
