import { Scroller } from '../scroller';
import { EMPTY_ITEM } from '../classes/adapter/context';
import { Process, ProcessStatus, Direction, ScrollerWorkflow } from '../interfaces/index';

const isInterrupted = ({ call }: ScrollerWorkflow): boolean => !!call.interrupted;

export default class End {

  static process = Process.end;

  static run(scroller: Scroller, { error }: any = {}) {
    const { workflow, state: { cycle: { interrupter } } } = scroller;

    if (!error && !interrupter) {
      // set out params accessible via Adapter
      End.calculateParams(scroller, workflow);
    }

    // explicit interruption for we don't want to go through the inner loop finalizing
    if (isInterrupted(workflow)) {
      workflow.call({ process: Process.end, status: ProcessStatus.done });
      return;
    }

    const next = End.finalizeInnerLoop(scroller, error);

    workflow.call({
      process: Process.end,
      status: next ? ProcessStatus.next : ProcessStatus.done,
      payload: { ...(interrupter ? { process: interrupter } : {}) }
    });
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

  static finalizeInnerLoop(scroller: Scroller, error: any): boolean {
    const { state, state: { cycle, clip }, adapter } = scroller;
    const next = !!cycle.interrupter || (error ? false : End.getNext(scroller));
    state.cycle.innerLoop.isInitial = false;
    state.fetch.stopSimulate();
    clip.noClip = scroller.settings.infinite || (next && clip.simulate);
    clip.forceReset();
    scroller.innerLoopCleanup();
    adapter.loopPending = false;
    state.cycle.innerLoop.done();
    return next;
  }

  static getNext(scroller: Scroller): boolean {
    const { state: { clip, fetch, render } } = scroller;
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
