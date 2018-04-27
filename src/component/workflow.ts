import { Subscription } from 'rxjs/Subscription';

import { Scroller } from './scroller';
import { calculateFlowDirection } from './utils/index';
import { Direction, Run, AdapterAction, ActionType, Process, ProcessSubject } from './interfaces/index';
import { PreFetch, Fetch, PostFetch, Render, PostRender, PreClip, Clip } from './processes/index';

export class Workflow {

  readonly context;
  private onScrollUnsubscribe: Function;
  private itemsSubscription: Subscription;
  private scrollerResolverSubscription: Subscription;
  private adapterResolverSubscription: Subscription;

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
    setTimeout(() => this.run());
  }

  reset() {
    this.runNew = null;
    this.runQueue = null;
  }

  subscribe() {
    this.onScrollUnsubscribe =
      this.context.renderer.listen(this.scroller.viewport.scrollable, 'scroll', this.scroll.bind(this));
    this.itemsSubscription = this.scroller.buffer.$items.subscribe(items => this.context.items = items);
    this.scrollerResolverSubscription = this.scroller.resolver$.subscribe(this.resolveScroller.bind(this));
    this.adapterResolverSubscription = this.scroller.adapter.subject.subscribe(this.resolveAdapter.bind(this));
  }

  dispose() {
    this.onScrollUnsubscribe();
    this.itemsSubscription.unsubscribe();
    this.scrollerResolverSubscription.unsubscribe();
    this.adapterResolverSubscription.unsubscribe();
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
      this.cyclesDone++;
      this.finalize();
    }
  }

  resolveAdapter(data: AdapterAction) {
    this.scroller.log(`"${data.action}" action is triggered via Adapter`);
    switch (data.action) {
      case ActionType.reload:
        this.scroller.reload(data.payload);
        this.reset();
        this.run();
        return;
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

    scroller.process$.subscribe((data: ProcessSubject) => {
      if (data.stop && !data.error) {
        scroller.log(`-- wf ${state.cycleCount} ${state.process} process ${data.break ? 'break' : 'stop'}`);
        scroller.done(data.break);
        return;
      }
      if (data.stop && data.error) {
        scroller.log(`-- wf ${state.cycleCount} ${state.process} process fail`);
        scroller.fail();
        return;
      }
      scroller.log(`-- wf ${state.cycleCount} ${state.process} process done`);

      // processes state machine
      switch (data.process) {
        case Process.start:
          PreFetch.run(scroller);
          break;
        case Process.preFetch:
          Fetch.run(scroller);
          break;
        case Process.fetch:
          PostFetch.run(scroller);
          break;
        case Process.postFetch:
          Render.run(scroller);
          break;
        case Process.render:
          PostRender.run(scroller);
          break;
        case Process.postRender:
          PreClip.run(scroller);
          break;
        case Process.preClip:
          Clip.run(scroller);
          break;
        case Process.clip:
          scroller.done();
          break;
      }
    }, () => null, function (this: any) {
      this.unsubscribe();
    });
  }

  finalize() {
    this.scroller.log(`~~~~~~ WF Cycle ${this.cyclesDone} FINALIZED ~~~~~~`);
  }

}
