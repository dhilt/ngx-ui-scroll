import { Workflow } from '../workflow';
import { Scroller } from '../scroller';
import { Direction, Process, ProcessSubject, Run } from '../interfaces/index';

export default class Scroll {

  static run(workflow: Workflow, direction: Direction) {
    const scroller: Scroller = workflow.scroller;
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
