import { Scroller } from '../scroller';
import { EMPTY_ITEM } from '../classes/adapter/context';
import { Process, ProcessStatus, Direction, ScrollerWorkflow } from '../interfaces/index';

const isInterrupted = (workflow: ScrollerWorkflow) => (workflow.call as any).interrupted;

export default class End {

  static process = Process.end;

  static run(scroller: Scroller, process: Process, payload: any = {}) {
    const { workflow } = scroller;
    const { error } = payload;

    if (!error && process !== Process.reset && process !== Process.reload) {
      // set out params, accessible via Adapter
      End.calculateParams(scroller, workflow);
    }

    // explicit interruption for we don't want go through the workflow loop finalizing
    if (isInterrupted(workflow)) {
      workflow.call({
        process,
        status: ProcessStatus.done,
        payload,
      });
      return;
    }

    // what next? done?
    const next = End.getNext(scroller, process, error);

    // finalize current workflow (inner) loop
    End.endWorkflowLoop(scroller, next);

    // continue the Workflow synchronously; current cycle could be finalized immediately
    workflow.call({
      process: Process.end,
      status: next ? ProcessStatus.next : ProcessStatus.done,
      payload: { process }
    });
  }

  static endWorkflowLoop(scroller: Scroller, next: boolean) {
    const { state, state: { clip }, adapter } = scroller;
    state.cycle.innerLoop.isInitial = false;
    state.fetch.stopSimulate();
    clip.noClip = scroller.settings.infinite || (next && clip.simulate);
    clip.forceReset();
    scroller.innerLoopCleanup();
    adapter.loopPending = false;
    state.cycle.innerLoop.count++;
  }

  static calculateParams(scroller: Scroller, workflow: ScrollerWorkflow) {
    const { adapter, viewport, buffer: { items } } = scroller;

    if (adapter.wanted.firstVisible) {
      const { item } = viewport.getEdgeVisibleItem(items, Direction.backward);
      if (!item || item.element !== adapter.firstVisible.element) {
        adapter.firstVisible = item ? item.get() : EMPTY_ITEM;
      }
    }

    // the workflow can be interrupter on firstVisible change
    if (adapter.wanted.lastVisible && !isInterrupted(workflow)) {
      const { item } = viewport.getEdgeVisibleItem(items, Direction.forward);
      if (!item || item.element !== adapter.lastVisible.element) {
        adapter.lastVisible = item ? item.get() : EMPTY_ITEM;
      }
    }
  }

  static getNext(scroller: Scroller, process: Process, error: boolean): boolean {
    const { state: { clip, fetch, render } } = scroller;
    if (error) {
      return false;
    }
    if (process === Process.reset || process === Process.reload) { // Adapter.reload/reset
      return true;
    }
    if (clip.simulate) { // Adapter.remove
      return true;
    }
    if (fetch.simulate && fetch.isReplace) { // Adapter.check (todo: combine with following)
      return true;
    }
    if (fetch.simulate && !render.noSize) { // Adapter.append/prepend/insert affected viewport size
      return true;
    }
    if ( // common inner loop (App start, Scroll, Adapter.clip) accompanied by fetch
      !fetch.simulate &&
      ((fetch.hasNewItems && !render.noSize) || fetch.hasAnotherPack)
    ) {
      return true;
    }
    return false;
  }

}
