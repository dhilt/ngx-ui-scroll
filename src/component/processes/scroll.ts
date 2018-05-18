import { Workflow } from '../workflow';
import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject, Run } from '../interfaces/index';
import { calculateFlowDirection } from '../utils/index';

export default class Scroll {

  static run(workflow: Workflow) {
    const scroller: Scroller = workflow.scroller;

    if (Scroll.syntheticScroll(scroller)) {
      scroller.callWorkflow(<ProcessSubject>{
        process: Process.scroll,
        status: 'done',
        payload: 'cancelled'
      });
      return;
    }

    const direction = calculateFlowDirection(scroller.viewport);
    if (!scroller.adapter.isLoading) {
      Scroll.next(scroller, direction);
    } else if (!scroller.scrollDelaySubscription || scroller.scrollDelaySubscription.closed) {
      scroller.scrollDelaySubscription = workflow.process$.subscribe((data: ProcessSubject) => {
        if (data.process === Process.end && data.status === 'done') {
          scroller.scrollDelaySubscription.unsubscribe();
          Scroll.next(scroller, direction);
        }
      });
    }
  }

  static syntheticScroll(scroller: Scroller): boolean {
    const viewport = scroller.viewport;
    if (viewport.syntheticScrollPosition === viewport.scrollPosition) {
      const ssp = viewport.scrollPosition;
      setTimeout(() => {
        if (ssp === viewport.scrollPosition) {
          viewport.syntheticScrollPosition = null;
        }
      });
      return true;
    }
  }

  static next(scroller: Scroller, direction: Direction) {
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.scroll,
      status: 'next',
      payload: <Run>{
        scroll: true,
        direction
      }
    });
  }
}
