import { Workflow } from './workflow';
import { debouncedRound } from './utils/index';
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
  public workflow: Workflow;
  private directionQueue: Direction;

  constructor(context) {
    this.context = context;
    this.workflow = new Workflow(this.context);
    this.initialize();
  }

  initialize() {
    const flow = this.workflow;

    const scrollHandler = () => {
        const direction = flow.viewport.getScrollDirection();
      if (!direction) { // no scroll
        return;
      }
      if (flow.pending && !flow.viewport.syntheticScroll) {
        this.directionQueue = direction;
        return;
      }
      debouncedRound(() => this.run(direction), 25);
    };

    this.onScrollListener = this.context.renderer.listen(flow.viewport.scrollable, 'scroll', scrollHandler);

    flow.buffer.$items.subscribe(items => this.context.items = items);

    flow.resolver.subscribe(
      (next) => {
        if (next) {
          this.run(flow.direction);
        } else if (this.directionQueue) {
          this.run(this.directionQueue);
          this.directionQueue = null;
        }
      },
      (error) => {
        throw error;
      }
    );

    this.run(Direction.forward);
    this.run(Direction.backward);
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

  clip() {
    return this.workflow.settings.infinite ?
      null :
      this.workflow.continue()
        .then(ShouldClip.run)
        .then(Clip.run);
  }

  fetch() {
    return this.workflow.continue()
      .then(ShouldFetch.run)
      .then(Fetch.run)
      .then(ProcessFetch.run)
      .then(Render.run)
      .then(AdjustFetch.run);
  }

  dispose() {
    this.onScrollListener();
    this.workflow.dispose();
  }

}
