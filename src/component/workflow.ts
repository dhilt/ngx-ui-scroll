import { Subscription } from 'rxjs/Subscription';

import { Scroller } from './scroller';
import { calculateFlowDirection } from './utils/index';
import { Direction, Run, AdapterAction, ActionType } from './interfaces/index';

import ShouldFetch from './workflow/shouldFetch';
import Fetch from './workflow/fetch';
import ProcessFetch from './workflow/processFetch';
import Render from './workflow/render';
import AdjustFetch from './workflow/adjustFetch';
import ShouldClip from './workflow/shouldClip';
import Clip from './workflow/clip';

export class Workflow {

  private context;
  private onScrollUnsubscribe: Function;
  private itemsSubscription: Subscription;
  private scrollerResolverSubscription: Subscription;
  private adapterResolverSubscription: Subscription;

  public scroller: Scroller;
  public cyclesDone: number;

  private runNew: Run = null;
  private runQueue: Run = null;

  constructor(context) {
    this.context = context;
    this.scroller = new Scroller(this.context);
    this.cyclesDone = 0;
    this.initialize();
  }

  initialize() {
    this.onScrollUnsubscribe =
      this.context.renderer.listen(this.scroller.viewport.scrollable, 'scroll', this.scroll.bind(this));
    this.itemsSubscription = this.scroller.buffer.$items.subscribe(items => this.context.items = items);
    this.scrollerResolverSubscription = this.scroller.resolver$.subscribe(this.resolveScroller.bind(this));
    this.adapterResolverSubscription = this.scroller.adapter.resolver$.subscribe(this.resolveAdapter.bind(this));

    this.run();
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
    if (this.runNew) {
      this.run(this.runNew);
      this.runNew = null;
    } else if (next) {
      this.run(next);
    } else if (this.runQueue) {
      this.run(this.runQueue);
      this.runQueue = null;
    } else {
      this.cyclesDone++;
      this.finalize();
    }
  }

  resolveAdapter(data: AdapterAction) {
    this.scroller.log(`"${data.action}" action is triggered via Adapter`);
    switch (data.action) {
      case ActionType.reload:
        return this.scroller.continue()
    }
  }

  run(options: Run = {}) {
    if (!options.direction) {
      options.direction = Direction.forward; // default direction
      this.runQueue = {
        ...options,
        direction: options.direction === Direction.forward ? Direction.backward : Direction.forward
      };
    }
    if (this.scroller.state.pending) {
      this.runNew = { ...options };
      return;
    }
    this.start(options);
  }

  start(options: Run) {
    this.scroller.start(options)
      .then(() => this.fetch())
      .then(() => this.clip())
      .then(() =>
        this.scroller.done()
      )
      .catch(error =>
        this.scroller.fail(error)
      );
  }

  fetch() {
    return this.scroller.continue()
      .then(ShouldFetch.run)
      .then(Fetch.run)
      .then(ProcessFetch.run)
      .then(Render.run)
      .then(AdjustFetch.run);
  }

  clip() {
    return this.scroller.settings.infinite ?
      null :
      this.scroller.continue()
        .then(ShouldClip.run)
        .then(Clip.run);
  }

  dispose() {
    this.onScrollUnsubscribe();
    this.itemsSubscription.unsubscribe();
    this.scrollerResolverSubscription.unsubscribe();
    this.scroller.dispose();
  }

  finalize() {
    this.scroller.log(`~~~~~~ WF Cycle ${this.cyclesDone} FINALIZED ~~~~~~`);
  }

}
