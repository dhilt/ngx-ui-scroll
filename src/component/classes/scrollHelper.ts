import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Workflow } from '../workflow';
import { Direction, Process, ProcessSubject } from '../interfaces/index';

export class ScrollHelper {

  readonly workflow: Workflow;
  readonly onScrollHandler: Function;
  readonly scrollEventOptions: any;
  private lastScrollTime: number;
  private scrollTimer: number | null;
  private lastScrollPosition: number;
  private endSubscription: Subscription | null;
  private scrollEventElement: any;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
    this.lastScrollTime = 0;
    this.scrollTimer = null;
    this.endSubscription = null;
    this.scrollEventElement = workflow.scroller.viewport.scrollEventElement;
    this.onScrollHandler = this.run.bind(this);

    // passive mode
    let passiveSupported = false;
    try {
      window.addEventListener('test', <EventListenerOrEventListenerObject>{}, Object.defineProperty({}, 'passive', {
        get: () => {
          passiveSupported = true;
        }
      }));
    } catch (err) {
    }
    this.scrollEventOptions = passiveSupported ? { passive: false } : false;
  }

  addScrollHandler() {
    this.scrollEventElement.addEventListener('scroll', this.onScrollHandler, this.scrollEventOptions);
  }

  removeScrollHandler() {
    this.scrollEventElement.removeEventListener('scroll', this.onScrollHandler, this.scrollEventOptions);
  }

  run() {
    // console.log(this.workflow.scroller.viewport.scrollPosition);
    if (this.workflow.scroller.state.syntheticScroll.position !== null) {
      if (!this.processSyntheticScroll()) {
        return;
      }
    }
    this.throttledScroll();
  }

  processSyntheticScroll(): boolean {
    const { viewport, state, settings } = this.workflow.scroller;
    const position = viewport.scrollPosition;
    const syntheticPosition = <number>state.syntheticScroll.position;
    let result = true;

    // inertia scroll over synthetic scroll
    if (position !== syntheticPosition) {
      const inertiaDelay = Number(new Date()) - state.syntheticScroll.time;
      const inertiaDelta = <number>state.syntheticScroll.positionBefore - position;
      const syntheticDelta = syntheticPosition - position;
      const newPosition = Math.max(0, position + state.syntheticScroll.delta);

      if (inertiaDelta > 0 && inertiaDelta < syntheticDelta) {
        this.workflow.scroller.logger.log(() => 'Inertia scroll adjustment. Position: ' + position +
          ', synthetic position: ' + syntheticPosition + ', synthetic delta: ' + syntheticDelta +
          ', delay: ' + inertiaDelay + ', delta: ' + inertiaDelta);
        if (settings.inertia) {
          if (inertiaDelta <= settings.inertiaScrollDelta && inertiaDelay <= settings.inertiaScrollDelay) {
            viewport.scrollPosition = newPosition;
          }
        } else {
          viewport.scrollPosition = newPosition;
        }
      }
    } else {
      result = false;
    }

    if (syntheticPosition === state.syntheticScroll.position) {
      state.syntheticScroll.position = null;
    }
    return result;
  }

  throttledScroll() {
    const scroller = this.workflow.scroller;
    if (!scroller.settings.throttle) {
      this.debouncedScroll();
      return;
    }
    const diff = this.lastScrollTime + scroller.settings.throttle - Date.now();
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
    if (diff < 0) {
      this.lastScrollTime = Date.now();
      this.debouncedScroll();
    } else {
      this.scrollTimer = <any>setTimeout(() => {
        this.debouncedScroll();
        this.scrollTimer = null;
      }, diff);
    }
  }

  debouncedScroll() {
    if (!this.workflow.scroller.state.pending) {
      this.runWorkflow();
      return;
    }
    if (this.endSubscription) {
      return;
    }
    this.endSubscription = this.workflow.process$.pipe(
      filter((data: ProcessSubject) => data.process === Process.end && data.status === 'done')
    ).subscribe(() => {
      if (this.endSubscription) {
        this.endSubscription.unsubscribe();
      }
      this.endSubscription = null;
      this.runWorkflow();
    });
  }

  purgeProcesses() {
    if (this.endSubscription) {
      this.endSubscription.unsubscribe();
      this.endSubscription = null;
    }
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
  }

  getScrollDirection(): Direction {
    const scroller = this.workflow.scroller;
    const position = scroller.viewport.scrollPosition;
    let lastPosition = scroller.state.lastPosition;
    if (position === lastPosition) {
      lastPosition = scroller.state.fetch.position;
      if (position === lastPosition) {
        scroller.logger.log(() => `scroll position: ${position} (has not been changed)`);
        return Direction.forward;
      }
    }
    scroller.logger.log(() => `scroll position: ${position}`);
    return position < lastPosition ? Direction.backward : Direction.forward;
  }

  runWorkflow() {
    this.purgeProcesses();
    this.workflow.callWorkflow(<ProcessSubject>{
      process: Process.scroll,
      status: 'next',
      payload: this.getScrollDirection()
    });
  }

}
