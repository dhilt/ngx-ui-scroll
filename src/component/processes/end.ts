import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject, Run } from '../interfaces/index';

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
        direction: scroller.state.direction,
        scroll: scroller.state.scroll
      };
    } else if (!scroller.buffer.size && scroller.state.fetch.shouldFetch && !scroller.state.fetch.hasNewItems) {
      nextRun = {
        direction: scroller.state.direction === Direction.forward ? Direction.backward : Direction.forward,
        scroll: false
      };
    } else if (scroller.state.isInitial) {
      scroller.state.isInitial = false;
      nextRun = {
        direction: Direction.backward,
        scroll: scroller.state.scroll || false
      };
    }
    return nextRun;
  }
}
