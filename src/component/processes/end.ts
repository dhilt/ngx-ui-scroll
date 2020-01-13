import { Scroller } from '../scroller';
import { Process, ProcessStatus, Direction } from '../interfaces/index';
import { itemAdapterEmpty } from '../utils/adapter';

export default class End {

  static run(scroller: Scroller, process: Process, payload: any = {}) {
    const { workflow, state } = scroller;
    const { error } = payload;

    state.workflowOptions.reset();

    if (!error && process !== Process.reload) {
      // set out params, accessible via Adapter
      End.calculateParams(scroller);
    }

    // explicit interruption for we don't want go through the workflow loop finalizing
    if ((<any>workflow.call).interrupted) {
      return workflow.call();
    }

    // what next? done?
    const next = End.getNext(scroller, process, error);

    // need to apply Buffer.items changes if clip
    if (state.clip.doClip) {
      scroller.runChangeDetector();
    }

    // finalize current workflow loop
    End.endWorkflowLoop(scroller, next);
    state.innerLoopCount++;

    // continue the Workflow synchronously; current cycle could be finalized immediately
    workflow.call({
      process: Process.end,
      status: next ? ProcessStatus.next : ProcessStatus.done,
      payload: process
    });

    // if the Workflow isn't finalized, it may freeze for no more than settings.throttle ms
    if (state.workflowPending && !state.loopPending) {
      // continue the Workflow asynchronously
      End.continueWorkflowByTimer(scroller);
    }
  }

  static endWorkflowLoop(scroller: Scroller, next: boolean) {
    const { state, state: { clip } } = scroller;
    state.countDone++;
    state.isInitialLoop = false;
    state.fetch.simulate = false;
    clip.noClip = scroller.settings.infinite || (next && clip.simulate);
    clip.forceReset();
    state.lastPosition = scroller.viewport.scrollPosition;
    scroller.purgeInnerLoopSubscriptions();
    state.loopPending = false;
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

  static getNext(scroller: Scroller, process: Process, error: boolean): boolean {
    const { state: { clip, fetch, scrollState, workflowOptions } } = scroller;
    if (error) {
      workflowOptions.empty = true;
      return false;
    }
    if (process === Process.reload) {
      return true;
    }
    if (clip.simulate) {
      return true;
    }
    let result = false;
    if (!fetch.simulate) {
      if (fetch.hasNewItems) {
        result = true;
        workflowOptions.scroll = false;
      } else if (fetch.hasAnotherPack) {
        result = true;
        workflowOptions.scroll = false;
      }
    }
    if (scrollState.keepScroll) {
      result = true;
      workflowOptions.scroll = true;
      workflowOptions.keepScroll = true;
    }
    return result;
  }

  static continueWorkflowByTimer(scroller: Scroller) {
    const { state, state: { workflowCycleCount, innerLoopCount, workflowOptions } } = scroller;
    scroller.logger.log(() => `setting Workflow timer (${workflowCycleCount}-${innerLoopCount})`);
    state.scrollState.workflowTimer = <any>setTimeout(() => {
      // if the WF isn't finalized while the old sub-cycle is done and there's no new sub-cycle
      if (state.workflowPending && !state.loopPending && innerLoopCount === state.innerLoopCount) {
        workflowOptions.scroll = true;
        workflowOptions.byTimer = true;
        workflowOptions.keepScroll = false;
        scroller.workflow.call({
          process: Process.end,
          status: ProcessStatus.next
        });
      }
    }, scroller.settings.throttle);
  }

}
