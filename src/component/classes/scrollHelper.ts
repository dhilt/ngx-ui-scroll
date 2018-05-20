import { Direction, Process, ProcessSubject } from '../interfaces/index';
import { Scroller } from '../scroller';

export class ScrollHelper {

  readonly scroller: Scroller;
  private lastScrollTime: number;
  private scrollTimer: number;
  private lastScrollPosition: number;

  constructor(scroller: Scroller) {
    this.scroller = scroller;
    this.lastScrollTime = 0;
    this.scrollTimer = null;
  }

  run() {
    const viewport = this.scroller.viewport;
    if (viewport.syntheticScrollPosition === viewport.scrollPosition) {
      const ssp = viewport.scrollPosition;
      setTimeout(() => {
        if (ssp === viewport.scrollPosition) {
          viewport.syntheticScrollPosition = null;
        }
      });
      return true;
    }
    let direction;
    if (!this.scroller.adapter.isLoading) {
      direction = this.calculateFixedDirection();
    } else {
      const diff = this.scroller.viewport.scrollPosition - this.lastScrollPosition;
      if (!diff) {
        return;
      }
      direction = diff > 0 ? Direction.forward : Direction.backward;
    }
    this.throttledScroll(direction);
  }

  calculateFixedDirection(): Direction {
    const viewport = this.scroller.viewport;
    const scrollPosition = viewport.scrollPosition;
    const viewportSize = viewport.scrollable.scrollHeight;
    const backwardPadding = viewport.padding[Direction.backward].size;
    if (scrollPosition < backwardPadding || scrollPosition === 0) {
      return Direction.backward;
    }
    if (scrollPosition <= viewportSize - backwardPadding) {
      const lastScrollPosition = viewport.getLastPosition();
      if (lastScrollPosition < scrollPosition) {
        return Direction.forward;
      } else if (lastScrollPosition > scrollPosition) {
        return Direction.backward;
      }
    }
    return Direction.forward;
  }

  throttledScroll(direction: Direction) {
    const scroller = this.scroller;
    const diff = this.lastScrollTime + scroller.settings.throttle - Date.now();
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }
    if (diff < 0) {
      scroller.callWorkflow(<ProcessSubject>{
        process: Process.scroll,
        status: 'start',
        payload: direction
      });
      this.lastScrollTime = Date.now();
      this.lastScrollPosition = scroller.viewport.scrollPosition;
    } else {
      this.scrollTimer = <any>setTimeout(() => {
        this.throttledScroll(direction);
        this.scrollTimer = null;
      }, diff);
    }
  }
}
