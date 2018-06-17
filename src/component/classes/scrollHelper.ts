import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { Workflow } from '../workflow';
import { Process, ProcessSubject } from '../interfaces/index';

export class ScrollHelper {

  readonly workflow: Workflow;
  private lastScrollTime: number;
  private scrollTimer: number | null;
  private lastScrollPosition: number;
  private endSubscription: Subscription | null;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
    this.lastScrollTime = 0;
    this.scrollTimer = null;
    this.endSubscription = null;
  }

  run() {
    const viewport = this.workflow.scroller.viewport;
    if (viewport.syntheticScrollPosition === viewport.scrollPosition) {
      const ssp = viewport.scrollPosition;
      setTimeout(() => {
        if (ssp === viewport.scrollPosition) {
          viewport.syntheticScrollPosition = null;
        }
      });
      return;
    }
    if (this.workflow.scroller.state.pending) {
      if (!this.endSubscription) {
        this.endSubscription = this.workflow.process$.pipe(
          filter((data: ProcessSubject) => data.process === Process.end && data.status === 'done')
        ).subscribe(() => {
          if (this.endSubscription) {
            this.endSubscription.unsubscribe();
          }
          this.endSubscription = null;
          this.run();
        });
      }
      return;
    }
    this.throttledScroll();
  }

  throttledScroll() {
    const scroller = this.workflow.scroller;
    const diff = this.lastScrollTime + scroller.settings.throttle - Date.now();
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
    if (diff < 0) {
      this.lastScrollTime = Date.now();
      this.lastScrollPosition = scroller.viewport.scrollPosition;
      this.processScroll();
    } else {
      this.scrollTimer = <any>setTimeout(() => {
        this.run();
        this.scrollTimer = null;
      }, diff);
    }
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

  processScroll() {
    this.purgeProcesses();
    this.workflow.callWorkflow(<ProcessSubject>{
      process: Process.scroll,
      status: 'next'
    });
  }
}
