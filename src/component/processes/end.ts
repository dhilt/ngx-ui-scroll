import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject, Run } from '../interfaces/index';

export default class End {

  static run(scroller: Scroller, isFail?: boolean) {
    scroller.state.endCycle();
    scroller.adapter.isLoading = false;
    scroller.viewport.saveScrollPosition();
    scroller.purgeCycleSubscriptions();
    scroller.finalize();
    let next: Run = null;

    if (isFail) {
      scroller.log(`---=== Workflow ${scroller.state.cycleCount } fail`);
    } else {
      scroller.log(`---=== Workflow ${scroller.state.cycleCount } done`);
      if (scroller.state.isInitial) {
        next = {
          resetInit: true,
          direction: Direction.backward,
          scroll: false
        };
      }
      if (scroller.state.fetch.hasNewItems || scroller.state.clip.shouldClip) {
        next = { direction: scroller.state.direction, scroll: scroller.state.scroll };
      }
      if (!scroller.buffer.size && scroller.state.fetch.shouldFetch && !scroller.state.fetch.hasNewItems) {
        next = {
          direction: scroller.state.direction === Direction.forward ? Direction.backward : Direction.forward,
          scroll: false
        };
      }
    }

    scroller.process$.next(<ProcessSubject>{
      process: Process.end,
      status: next ? 'next' : 'done',
      payload: next
    });
  }
}
