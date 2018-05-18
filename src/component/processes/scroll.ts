import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject, Run } from '../interfaces/index';
import { calculateFlowDirection } from '../utils';

export default class Scroll {

  static run(scroller: Scroller) {
    const direction = calculateFlowDirection(scroller.viewport);
    if (!scroller.adapter.isLoading) {
      Scroll.next(scroller, direction);
    } else if (!scroller.scrollSubscription || scroller.scrollSubscription.closed) {
      scroller.log('*** scroll subscribe ***');
      scroller.scrollSubscription = scroller.process$.subscribe((data: ProcessSubject) => {
        if (data.process === Process.end && data.status === 'done') {
          scroller.scrollSubscription.unsubscribe();
          Scroll.next(scroller, direction);
        }
      });
    }
  }

  static next(scroller: Scroller, direction: Direction) {
    scroller.process$.next(<ProcessSubject>{
      process: Process.scroll,
      status: 'next',
      payload: <Run>{
        scroll: true,
        direction
      }
    });
  }
}
