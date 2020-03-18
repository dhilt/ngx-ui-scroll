import { Scroller } from '../scroller';
import { Process, ProcessStatus, Direction } from '../interfaces/index';
import { itemAdapterEmpty } from '../utils/adapter';

export default class End {

  static run(scroller: Scroller, process: Process, payload: any = {}) {
    const { workflow, state, adapter } = scroller;
    const { error } = payload;

    state.workflowOptions.reset();

    if (!error && process !== Process.reset && process !== Process.reload) {
      // set out params, accessible via Adapter
      End.calculateParams(scroller);
    }

    // explicit interruption for we don't want go through the workflow loop finalizing
    if ((<any>workflow.call).interrupted) {
      return workflow.call({ process, status: ProcessStatus.done, payload });
    }

    // what next? done?
    const next = End.getNext(scroller, process, error);

    // finalize current workflow loop
    End.endWorkflowLoop(scroller, next);
    state.innerLoopCount++;

    // continue the Workflow synchronously; current cycle could be finalized immediately
    workflow.call({
      process: Process.end,
      status: next ? ProcessStatus.next : ProcessStatus.done,
      payload: { process, keepScroll: state.workflowOptions.keepScroll }
    });

    // if the Workflow isn't finalized, it may freeze for no more than settings.throttle ms
    if (adapter.cyclePending && !adapter.loopPending) {
      // continue the Workflow asynchronously
      End.continueWorkflowByTimer(scroller);
    }
  }

  static endWorkflowLoop(scroller: Scroller, next: boolean) {
    const { state, state: { clip }, adapter } = scroller;
    state.countDone++;
    state.isInitialLoop = false;
    state.fetch.stopSimulate();
    clip.noClip = scroller.settings.infinite || (next && clip.simulate);
    clip.forceReset();
    state.lastPosition = scroller.viewport.scrollPosition;
    scroller.purgeInnerLoopSubscriptions();
    adapter.loopPending = false;
  }

  static calculateParams(scroller: Scroller) {
    const { buffer: { items }, adapter } = scroller;

    // first visible item
    if (adapter.wanted.firstVisible) {
      const viewportBackwardEdge = scroller.viewport.getEdge(Direction.backward);
      const firstItem = items.find(item =>
        scroller.viewport.getElementEdge(item.element, Direction.forward) > viewportBackwardEdge
      );
      if (!firstItem || firstItem.element !== adapter.firstVisible.element) {
        adapter.firstVisible = firstItem ? firstItem.get() : itemAdapterEmpty;
      }
    }

    // last visible item
    if (adapter.wanted.lastVisible) {
      const viewportForwardEdge = scroller.viewport.getEdge(Direction.forward);
      let lastItem = null;
      for (let i = items.length - 1; i >= 0; i--) {
        const edge = scroller.viewport.getElementEdge(items[i].element, Direction.backward);
        if (edge < viewportForwardEdge) {
          lastItem = items[i];
          break;
        }
      }
      if (!lastItem || lastItem.element !== adapter.lastVisible.element) {
        adapter.lastVisible = lastItem ? lastItem.get() : itemAdapterEmpty;
      }
    }
  }

  static getNext(scroller: Scroller, process: Process, error: boolean): boolean {
    const { state: { clip, fetch, scrollState, workflowOptions } } = scroller;
    if (error) {
      workflowOptions.empty = true;
      return false;
    }
    if (process === Process.reset || process === Process.reload) {
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
    const { state, state: { workflowCycleCount, innerLoopCount, workflowOptions }, adapter } = scroller;
    scroller.logger.log(() => `setting Workflow timer (${workflowCycleCount}-${innerLoopCount})`);
    state.scrollState.workflowTimer = <any>setTimeout(() => {
      // if the WF isn't finalized while the old sub-cycle is done and there's no new sub-cycle
      if (adapter.cyclePending && !adapter.loopPending && innerLoopCount === state.innerLoopCount) {
        workflowOptions.scroll = true;
        workflowOptions.byTimer = true;
        workflowOptions.keepScroll = false;
        scroller.workflow.call({
          process: Process.end,
          status: ProcessStatus.next,
          payload: { keepScroll: state.workflowOptions.keepScroll }
        });
      }
    }, scroller.settings.throttle);
  }

}
