import { Scroller } from '../scroller';
import { Direction, Process, ProcessStatus, ScrollEventData, ScrollerWorkflow } from '../interfaces/index';
import { ScrollEventData2 } from '../interfaces/state';

export default class Scroll {

  static run(scroller: Scroller, process: Process, payload?: { event?: Event }) {
    const { workflow, viewport, state: { scrollState } } = scroller;
    const position = viewport.scrollPosition;

    if (Scroll.onSynthetic(scroller, position)) {
      return;
    }

    if (Scroll.onThrottle(scroller, position)) {
      return;
    }

    if (Scroll.onPending(scroller, position)) {
      return;
    }

    workflow.call({
      process: Process.scroll,
      status: ProcessStatus.next
    });
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

  static onThrottle(scroller: Scroller, position: number): boolean {
    const { scrollState } = scroller.state;
    const { direction, time } = Scroll.setCurrent(scroller, position);
    scroller.logger.log(() => [
      direction === Direction.backward ? '\u2934' : '\u2935',
      position,
      (scrollState.previous ? (time - scrollState.previous.time) : 0) + 'ms'
    ]);

    // throttle ...

    scrollState.previous = { position, time, direction };

    return false;
  }

  static setCurrent(scroller: Scroller, position: number): ScrollEventData2 {
    const time = Number(new Date());
    let direction: Direction | null = Direction.forward;
    const { scrollState } = scroller.state;
    const { previous } = scrollState;
    if (previous) {
      if (position === previous.position) {
        direction = previous.direction;
      } else if (position < previous.position) {
        direction = Direction.backward;
      }
    }
    scrollState.current = { position, direction, time };
    return scrollState.current;
  }

  static onPending(scroller: Scroller, position: number): boolean {
    if (!scroller.adapter.isLoading) {
      return false;
    }
    scroller.logger.log(() => ['skipping scroll', position, '[pending]']);
    return true;
  }

}
