import { Subscription } from 'rxjs/Subscription';

import { Workflow } from './workflow';
import { throttle, calculateFlowDirection } from './utils/index';
import { Direction, Run } from './interfaces/index';

import ShouldFetch from './workflow/shouldFetch';
import Fetch from './workflow/fetch';
import ProcessFetch from './workflow/processFetch';
import Render from './workflow/render';
import AdjustFetch from './workflow/adjustFetch';
import ShouldClip from './workflow/shouldClip';
import Clip from './workflow/clip';

export class WorkflowRunner {

  private context;
  private onScrollListener: Function;
  private itemsSubscription: Subscription;
  private flowResolverSubscription: Subscription;
  public workflow: Workflow;
  public count: number;
  private runNew: Run;
  private runQueue: Run;
  private defaultDirection = Direction.forward;

  constructor(context) {
    this.context = context;
    this.workflow = new Workflow(this.context);
    this.count = 0;
    this.runQueue = null;
    this.runNew = null;
    this.initialize();
  }

  initialize() {
    this.onScrollListener =
      this.context.renderer.listen(this.workflow.viewport.scrollable, 'scroll', this.scroll.bind(this));
    this.itemsSubscription = this.workflow.buffer.$items.subscribe(items => this.context.items = items);
    this.flowResolverSubscription = this.workflow.resolver.subscribe(this.resolve.bind(this));

    this.run();
  }

  scroll() {
    const viewport = this.workflow.viewport;
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

  resolve(next: Run = null) {
    if (this.runNew) {
      this.run(this.runNew);
      this.runNew = null;
    } else if (next) {
      this.run(next);
    } else if (this.runQueue) {
      this.run(this.runQueue);
      this.runQueue = null;
    } else {
      this.count++;
      this.finalize();
    }
  }

  run(options: Run = {}) {
    if (!options.direction) {
      options.direction = this.defaultDirection;
      this.runQueue = {
        ...options,
        direction: options.direction === Direction.forward ? Direction.backward : Direction.forward
      };
    }
    if (this.workflow.pending) {
      this.runNew = { ...options };
      return;
    }
    this.workflow.start(options)
      .then(() => this.fetch())
      .then(() => this.clip())
      .then(() =>
        this.workflow.done()
      )
      .catch(error =>
        this.workflow.fail(error)
      );
  }

  fetch() {
    return this.workflow.continue()
      .then(ShouldFetch.run)
      .then(Fetch.run)
      .then(ProcessFetch.run)
      .then(Render.run)
      .then(AdjustFetch.run);
  }

  clip() {
    return this.workflow.settings.infinite ?
      null :
      this.workflow.continue()
        .then(ShouldClip.run)
        .then(Clip.run);
  }

  dispose() {
    this.onScrollListener();
    this.itemsSubscription.unsubscribe();
    this.flowResolverSubscription.unsubscribe();
    this.workflow.dispose();
  }

  finalize() {
    this.workflow.log(`~~~~~~ WF Cycle ${this.count} FINALIZED ~~~~~~`);
    const count = this.count;
    setTimeout(() => {
      if (count === this.count && !this.workflow.pending) {
        this.stop();
      }
    });
  }

  stop() {
  }

}
