import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus, ScrollEventData, ScrollerWorkflow } from '../interfaces/index';

export default class Scroll {

  static run(scroller: Scroller, process: Process, payload?: { event?: Event }) {
    const { workflow, viewport, state: { scrollState } } = scroller;
    const position = viewport.scrollPosition;

    if (Scroll.onSynthetic(scroller, position)) {
      return;
    }

    Scroll.onThrottle(scroller, position, () =>
      Scroll.onScroll(scroller, workflow)
    );
  }

  static onSynthetic(scroller: Scroller, position: number): boolean {
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

  static onThrottle(scroller: Scroller, position: number, done: Function) {
    const { state: { scrollState }, settings: { throttle }, logger } = scroller;
    scrollState.current = Scroll.getScrollEvent(scroller, position, scrollState.previous);
    const { direction, time } = scrollState.current;
    const timeDiff = scrollState.previous ? time - scrollState.previous.time : Infinity;
    const delta = throttle - timeDiff;
    const shouldDelay = isFinite(delta) && delta > 0;
    const alreadyDelayed = !!scrollState.scrollTimer;
    logger.log(() => [
      direction === Direction.backward ? '\u2934' : '\u2935',
      position,
      shouldDelay ? (timeDiff + 'ms') : '0ms',
      shouldDelay ? (alreadyDelayed ? 'delayed' : `/ ${delta}ms delay`) : ''
    ]);
    if (!shouldDelay) {
      if (scrollState.scrollTimer) {
        clearTimeout(scrollState.scrollTimer);
        scrollState.scrollTimer = null;
      }
      done();
      return;
    }
    if (!alreadyDelayed) {
      scrollState.scrollTimer = setTimeout(() => {
        logger.log(() => {
          const curr = Scroll.getScrollEvent(scroller, scroller.viewport.scrollPosition, scrollState.current);
          return [
            curr.direction === Direction.backward ? '\u2934' : '\u2935',
            curr.position,
            (curr.time - time) + 'ms',
            'triggered by timer set on',
            position
          ];
        });
        scrollState.scrollTimer = null;
        done();
      }, delta);
    }
  }

  static getScrollEvent(scroller: Scroller, position: number, previous: ScrollEventData | null): ScrollEventData {
    const time = Number(new Date());
    let direction: Direction | null = Direction.forward;
    const { scrollState } = scroller.state;
    if (previous) {
      if (position === previous.position) {
        direction = previous.direction;
      } else if (position < previous.position) {
        direction = Direction.backward;
      }
    }
    return { position, direction, time };
  }

  static onScroll(scroller: Scroller, workflow: ScrollerWorkflow) {
    const { state: { scrollState }, adapter } = scroller;
    scrollState.previous = { ...(scrollState.current as ScrollEventData) };
    scrollState.current = null;

    if (adapter.isLoading) {
      scroller.logger.log(() => ['skipping scroll', (scrollState.previous as ScrollEventData).position, '[pending]']);
      return;
    }

    workflow.call({
      process: Process.scroll,
      status: ProcessStatus.next
    });
  }

}
