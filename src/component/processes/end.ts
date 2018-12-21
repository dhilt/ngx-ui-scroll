import { Scroller } from '../scroller';
import { Process, ProcessStatus, ProcessRun, Direction } from '../interfaces/index';
import { itemAdapterEmpty } from '../classes/adapter';

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
    if (scroller.state.workflowPending && !scroller.state.loopPending) {
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
    const { items } = scroller.buffer;

    // first visible item
    if (scroller.state.firstVisibleWanted) {
      const viewportBackwardEdge = scroller.viewport.getEdge(Direction.backward);
      const firstItem = items.find(item =>
        scroller.viewport.getElementEdge(item.element, Direction.forward) > viewportBackwardEdge
      );
      scroller.state.firstVisibleItem = firstItem ? {
        $index: firstItem.$index,
        data: firstItem.data,
        element: firstItem.element
      } : itemAdapterEmpty;
    }

    // last visible item
    if (scroller.state.lastVisibleWanted) {
      const viewportForwardEdge = scroller.viewport.getEdge(Direction.forward);
      let lastItem = null;
      for (let i = items.length - 1; i >= 0; i--) {
        const edge = scroller.viewport.getElementEdge(items[i].element, Direction.backward);
        if (edge < viewportForwardEdge) {
          lastItem = items[i];
          break;
        }
      }
      scroller.state.lastVisibleItem = lastItem ? {
        $index: lastItem.$index,
        data: lastItem.data,
        element: lastItem.element
      } : itemAdapterEmpty;
    }
  }

  static getNext(scroller: Scroller, error?: any): ProcessRun | null {
    const { state: { fetch, scrollState } } = scroller;
    let next: ProcessRun | null = null;
    if (!error) {
      if (fetch.hasNewItems) {
        next = { scroll: false };
      } else if (fetch.hasAnotherPack) {
        next = { scroll: false };
      }
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
      if (state.workflowPending && !state.loopPending && innerLoopCount === state.innerLoopCount) {
        scroller.callWorkflow({
          process: Process.end,
          status: ProcessStatus.next,
          payload: { scroll: true, byTimer: true }
        });
      }
    }, scroller.settings.throttle);
  }

}
