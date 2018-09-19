import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessSubject, ProcessRun, Direction } from '../interfaces/index';

export default class End {

  static run(scroller: Scroller, error?: any) {
    // finalize current sub-cycle
    End.endCycle(scroller);

    // set out params, accessible via Adapter
    End.calculateParams(scroller);

    // what next? done?
    const next = End.getNext(scroller, error);

    // need to apply Buffer.items changes if clip
    if (scroller.state.clip) {
      scroller.runChangeDetector();
    }

    // stub method call
    scroller.finalize();

    // continue the Workflow synchronously
    scroller.callWorkflow(<ProcessSubject>{
      process: Process.end,
      status: next ? ProcessStatus.next : ProcessStatus.done,
      ...(next ? { payload: next } : {})
    });

    // the Workflow may freeze for no more than settings.throttle ms
    if (next) {
      // continue the Workflow asynchronously
      End.continueWorkflowByTimer(scroller);
    }
  }

  static endCycle(scroller: Scroller) {
    const { state } = scroller;
    state.endCycle();
    state.lastPosition = scroller.viewport.scrollPosition;
    scroller.purgeCycleSubscriptions();
  }

  static calculateParams(scroller: Scroller) {
    const items = scroller.buffer.items;
    const length = items.length;
    const viewportBackwardEdge = scroller.viewport.getEdge(Direction.backward);
    const viewportForwardEdge = scroller.viewport.getEdge(Direction.forward);
    let index = null;
    for (let i = 0; i < length; i++) {
      const edge = scroller.viewport.getElementEdge(items[i].element, Direction.backward, true);
      if (edge > viewportBackwardEdge) {
        index = i;
        break;
      }
    }
    scroller.state.firstVisibleItem = index !== null ? {
      $index: items[index].$index,
      data: items[index].data,
      element: items[index].element
    } : {};

    index = null;
    for (let i = length - 1; i >= 0; i--) {
      const edge = scroller.viewport.getElementEdge(items[i].element, Direction.forward, true);
      if (edge < viewportForwardEdge) {
        index = i;
        break;
      }
    }
    scroller.state.lastVisibleItem = index !== null ? {
      $index: items[index].$index,
      data: items[index].data,
      element: items[index].element
    } : {};
  }

  static getNext(scroller: Scroller, error?: any): ProcessRun | null {
    let next: ProcessRun | null = null;
    if (!error) {
      if (scroller.state.fetch.hasNewItems) {
        next = { scroll: false, keepScroll: false };
      }
      if (scroller.state.scrollState.keepScroll) {
        next = { scroll: true, keepScroll: true };
      }
    }
    return next;
  }

  static continueWorkflowByTimer(scroller: Scroller) {
    const { state, state: { cycleCount } } = scroller;
    state.scrollState.workflowTimer = setTimeout(() => {
      // if the WF isn't finilized while the old sub-cycle is done and there's no new sub-cycle
      if (state.workflowPending && !state.pending && cycleCount === state.cycleCount) {
        scroller.callWorkflow(<ProcessSubject>{
          process: Process.end,
          status: ProcessStatus.next,
          payload: 'by timer'
        });
      }
    }, scroller.settings.throttle);
  }

}
