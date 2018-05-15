import { Subscription } from 'rxjs/Subscription';

import { Scroller } from './scroller';
import { calculateFlowDirection } from './utils/index';
import { Direction, Run, Process, ProcessSubject } from './interfaces/index';
import { Init, Reload, PreFetch, Fetch, PostFetch, Render, PostRender, PreClip, Clip } from './processes/index';
import Start from './processes/start';
import End from './processes/end';

export class Workflow {

  readonly context;
  private onScrollUnsubscribe: Function;
  private itemsSubscription: Subscription;

  public scroller: Scroller;
  public cyclesDone: number;

  private runNew: Run;
  private runQueue: Run;

  constructor(context) {
    this.context = context;
    this.scroller = new Scroller(this.context);
    this.cyclesDone = 0;
    this.reset();
    this.subscribe();
    setTimeout(() => this.wf());
  }

  wf() {
    const scroller = this.scroller;
    scroller.process$.subscribe((data: ProcessSubject) => {
      scroller.log('process ' + data.process + ', ' + data.status);
      if (data.status === 'error') {
        scroller.done();
        return;
      }
      switch (data.process) {
        case Process.reload:
          if (data.status === 'start') {
            Reload.run(scroller, data.payload);
          }
          if (data.status === 'next') {
            Init.run(scroller);
          }
          break;
        case Process.init:
          if (data.status === 'start') {
            Init.run(scroller);
          }
          if (data.status === 'next') {
            Start.run(scroller);
          }
          break;
        case Process.start:
          if (data.status === 'next') {
            PreFetch.run(scroller);
          }
          break;
        case Process.preFetch:
          if (data.status === 'next') {
            Fetch.run(scroller);
          }
          if (data.status === 'done') {
            End.run(scroller);
          }
          break;
        case Process.fetch:
          if (data.status === 'next') {
            PostFetch.run(scroller);
          }
          break;
        case Process.postFetch:
          if (data.status === 'next') {
            Render.run(scroller);
          }
          if (data.status === 'done') {
            End.run(scroller);
          }
          break;
        case Process.render:
          if (data.status === 'next') {
            PostRender.run(scroller);
          }
          break;
        case Process.postRender:
          if (data.status === 'next') {
            PreClip.run(scroller);
          }
          break;
        case Process.preClip:
          if (data.status === 'next') {
            Clip.run(scroller);
          }
          if (data.status === 'done') {
            End.run(scroller);
          }
          break;
        case Process.clip:
          if (data.status === 'done') {
            End.run(scroller);
          }
          break;
        case Process.end:
          if (data.status === 'next') {
            Start.run(scroller, data.payload);
          }
          if (data.status === 'done') {
            this.finalize();
          }
          break;
      }
    });
  }

  reset() {
    this.runNew = null;
    this.runQueue = null;
  }

  subscribe() {
    this.onScrollUnsubscribe =
      this.context.renderer.listen(this.scroller.viewport.scrollable, 'scroll', this.scroll.bind(this));
    this.itemsSubscription = this.scroller.buffer.$items.subscribe(items => this.context.items = items);
  }

  dispose() {
    this.onScrollUnsubscribe();
    this.itemsSubscription.unsubscribe();
    this.scroller.dispose();
  }

  scroll() {
    const viewport = this.scroller.viewport;
    if (viewport.syntheticScrollPosition === viewport.scrollPosition) {
      const ssp = viewport.scrollPosition;
      setTimeout(() => {
        if (ssp === viewport.scrollPosition) {
          viewport.syntheticScrollPosition = null;
        }
      });
      return;
    }
    this.run({
      scroll: true,
      direction: calculateFlowDirection(viewport)
    });
  }

  resolveScroller(next: Run = null) {
    let options = {};
    if (this.runNew) {
      options = { ...this.runNew };
      this.runNew = null;
      this.run(options);
    } else if (next) {
      this.run(next);
    } else if (this.runQueue) {
      options = { ...this.runQueue };
      this.runQueue = null;
      this.run(options);
    } else {
      this.done();
    }
  }

  run(options: Run = {}) {
    if (!options.direction) {
      options.direction = Direction.forward; // default direction
      this.runQueue = { // queue opposite direction
        ...options,
        direction: options.direction === Direction.forward ? Direction.backward : Direction.forward
      };
    }
    if (this.scroller.state.pending) { // postpone run if pending
      this.runNew = { ...options }; // only 1 (last) run should be postponed
      return;
    }
    this.start(options);
  }

  start(options: Run) {
    const scroller = this.scroller;
    const state = scroller.state;
    scroller.start(options);
  }

  done() {
    this.scroller.log(`~~~~~~ WF Cycle ${this.cyclesDone} FINALIZED ~~~~~~`);
    this.cyclesDone++;
    this.finalize();
  }

  finalize() {
  }

}
