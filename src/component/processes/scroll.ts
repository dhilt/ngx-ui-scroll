import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus, ScrollEventData, ScrollerWorkflow } from '../interfaces/index';

export default class Scroll {

  static run(scroller: Scroller, event?: Event) {
    const { workflow, viewport, state } = scroller;
    const position = viewport.scrollPosition;

    if (Scroll.processSynthetic(scroller, position)) {
      return;
    }

    const time = Number(new Date());
    const direction = Scroll.getDirection(scroller, position);
    const data = { position, time, direction } as ScrollEventData;

    scroller.logger.log(() => [
      direction === Direction.backward ? '\u2934' : '\u2935',
      position,
      (time - state.scrollState.time) + 'ms'
    ]);

    Scroll.delayScroll(scroller, workflow);
  }

  static processSynthetic(scroller: Scroller, position: number): boolean {
    const { scrollState } = scroller.state;
    const synthPos = scrollState.syntheticPosition;
    if (synthPos !== null) {
      if (scrollState.syntheticFulfill) {
        scrollState.syntheticPosition = null;
      }
      if (!scrollState.syntheticFulfill || synthPos === position) {
        scroller.logger.log(() => [
          'skipping scroll', position, `[${scrollState.syntheticFulfill ? '' : 'pre-'}synthetic]`
        ]);
        return true;
      }
      scroller.logger.log(() => [
        'synthetic scroll has been fulfilled:', position, position < synthPos ? '<' : '>', synthPos
      ]);
    }
    return false;
  }

  static getDirection(scroller: Scroller, newPosition: number): Direction {
    const { previous } = scroller.state.scrollState;
    if (!previous) {
      return Direction.forward;
    }
    const { position, direction } = previous;
    if (newPosition === position) {
      return direction || Direction.forward;
    }
    return newPosition > position ? Direction.forward : Direction.backward;
  }

  static delayScroll(scroller: Scroller, workflow: ScrollerWorkflow) {
    const { workflowOptions, scrollState: state } = scroller.state;
    if (!scroller.settings.throttle || workflowOptions.byTimer) {
      Scroll.doScroll(scroller, workflow);
      return;
    }
    const time = Number(Date.now());
    const tDiff = state.lastScrollTime + scroller.settings.throttle - time;
    const dDiff = scroller.settings.throttle + (state.firstScrollTime ? state.firstScrollTime - time : 0);
    const diff = Math.max(tDiff, dDiff);
    // scroller.logger.log('tDiff:', tDiff, 'dDiff:', dDiff, 'diff:', diff);
    if (diff <= 0) {
      scroller.purgeScrollTimers(true);
      state.lastScrollTime = time;
      state.firstScrollTime = 0;
      Scroll.doScroll(scroller, workflow);
    } else if (!state.scrollTimer && !state.keepScroll) {
      scroller.logger.log(() => `setting the timer at ${scroller.state.time + diff}`);
      state.firstScrollTime = time;
      state.scrollTimer = setTimeout(() => {
        state.scrollTimer = null;
        scroller.logger.log(() => `fire the timer (${scroller.state.time})`);
        workflowOptions.byTimer = true;
        Scroll.run(scroller);
      }, diff);
    }
    // else {
    //   scroller.logger.log('MISS TIMER');
    // }
  }

  static logPendingWorkflow(scroller: Scroller) {
    scroller.logger.log(() =>
      !scroller.state.scrollState.keepScroll ? [
        `setting %ckeepScroll%c flag (scrolling while the Workflow is pending)`,
        'color: #006600;', 'color: #000000;'
      ] : void 0);
  }

  static doScroll(scroller: Scroller, workflow: ScrollerWorkflow) {
    const { state: { scrollState, workflowOptions }, adapter } = scroller;
    if (adapter.cyclePending) {
      Scroll.logPendingWorkflow(scroller);
      scrollState.keepScroll = true;
      return;
    }
    workflowOptions.scroll = true;
    workflowOptions.keepScroll = scrollState.keepScroll;
    workflowOptions.noFetch = scroller.buffer.bof && scroller.buffer.eof;
    workflow.call({
      process: Process.scroll,
      status: ProcessStatus.next,
      payload: { keepScroll: workflowOptions.keepScroll }
    });
  }

}
