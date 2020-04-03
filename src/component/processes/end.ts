import { Scroller } from '../scroller';
import { Process, ProcessStatus, Direction } from '../interfaces/index';
import { itemAdapterEmpty } from '../utils/adapter';

export default class End {

  static run(scroller: Scroller, process: Process, payload: any = {}) {
    const { workflow, state, adapter } = scroller;
    const { error } = payload;

    if (!error && process !== Process.reset && process !== Process.reload) {
      // set out params, accessible via Adapter
      End.calculateParams(scroller);
    }

    // explicit interruption for we don't want go through the workflow loop finalizing
    if ((workflow.call as any).interrupted) {
      workflow.call({
        process,
        status: ProcessStatus.done,
        payload
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
    state.countDone++;
    state.isInitialLoop = false;
    state.fetch.stopSimulate();
    clip.noClip = scroller.settings.infinite || (next && clip.simulate);
    clip.forceReset();
    state.lastPosition = scroller.viewport.scrollPosition;
    scroller.purgeSubscriptions();
    adapter.loopPending = false;
    state.innerLoopCount++;
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
    const { state: { clip, fetch, render, scrollState } } = scroller;
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
