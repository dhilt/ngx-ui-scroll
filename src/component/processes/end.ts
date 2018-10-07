import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessRun, Direction } from '../interfaces/index';

export default class End {

  static run(scroller: Scroller, error?: any) {
    // finalize current workflow loop
    End.endWorkflowLoop(scroller);

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

    // continue the Workflow synchronously; current cycle could be finilized immediately
    scroller.callWorkflow({
      process: Process.end,
      status: next ? ProcessStatus.next : ProcessStatus.done,
      payload: next || { empty: true }
    });

    // if the Workflow isn't finilized, it may freeze for no more than settings.throttle ms
    if (scroller.state.workflowPending && !scroller.state.pending) {
      // continue the Workflow asynchronously
      End.continueWorkflowByTimer(scroller);
    }
  }

  static endWorkflowLoop(scroller: Scroller) {
    const { state } = scroller;
    state.endLoop();
    state.lastPosition = scroller.viewport.scrollPosition;
    scroller.purgeInnerLoopSubscriptions();
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
    const { state: { fetch, scrollState } } = scroller;
    let next: ProcessRun | null = null;
    if (!error) {
      if (fetch.hasNewItems) {
        next = { scroll: false };
      }
      // if (scrollState.window.delta) {
      //   console.log('%cWINDOW DELTA', 'background-color: red;');
      //   next = { scroll: true };
      // }
      if (scrollState.keepScroll) {
        next = { scroll: true, keepScroll: true };
      }
    }
    return next;
  }

  static continueWorkflowByTimer(scroller: Scroller) {
    const { state, state: { workflowCycleCount, innerLoopCount } } = scroller;
    scroller.logger.log(() => `setting Workflow timer (${workflowCycleCount}-${innerLoopCount})`);
    state.scrollState.workflowTimer = <any>setTimeout(() => {
      // if the WF isn't finilized while the old sub-cycle is done and there's no new sub-cycle
      if (state.workflowPending && !state.pending && innerLoopCount === state.innerLoopCount) {
        scroller.callWorkflow({
          process: Process.end,
          status: ProcessStatus.next,
          payload: { scroll: true, byTimer: true }
        });
      }
    }, scroller.settings.throttle);
  }

}
