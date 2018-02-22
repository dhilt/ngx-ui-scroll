import { Subscription } from 'rxjs/Subscription';

import { Workflow } from './workflow';
import { debouncedRound, calculateFlowDirection } from './utils/index';
import { Direction } from './interfaces/direction';

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
  public count = 0;
  private directionQueue: Direction;
  private initialDirection = Direction.forward;
  private initialOppositeDirection: Direction;

  constructor(context) {
    this.context = context;
    this.workflow = new Workflow(this.context);
    this.initialOppositeDirection = this.initialDirection === Direction.forward ? Direction.backward : Direction.forward;
    this.initialize();
  }

  initialize() {
    const flow = this.workflow;
    const onScroll = ($event) => this.scroll($event);

    this.onScrollListener = this.context.renderer.listen(flow.viewport.scrollable, 'scroll', onScroll);
    this.itemsSubscription = flow.buffer.$items.subscribe(items => this.context.items = items);
    this.flowResolverSubscription = flow.resolver.subscribe(this.resolve.bind(this));

    this.run(this.initialDirection);
  }

  scroll($event) {
    if (this.workflow.viewport.syntheticScrollPosition !== null) {
      if(this.workflow.viewport.scrollPosition === this.workflow.viewport.syntheticScrollPosition) {
        this.workflow.viewport.syntheticScrollPosition = null;
        return;
      }
      this.workflow.viewport.syntheticScrollPosition = null;
    }
    const direction = calculateFlowDirection(this.workflow.viewport, this.workflow.buffer);
    //debouncedRound(() => this.run(direction), 25);
    this.run(direction);
  }

  resolve(next: boolean) {
    if (this.directionQueue) {
      this.run(this.directionQueue);
      this.directionQueue = null;
    } else if (next) {
      this.run(this.workflow.direction);
    } else if (this.initialOppositeDirection) {
      this.run(this.initialOppositeDirection);
      this.initialOppositeDirection = null;
    } else {
      this.count++;
      this.finalize();
    }
  }

  run(direction?: Direction) {
    if (this.workflow.pending) {
      this.directionQueue = direction;
      return;
    }
    this.workflow.start(direction)
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

  finalize() { // stop queue
  }

}
