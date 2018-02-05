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
  private workflow: Workflow;

  constructor(context) {
    this.context = context;
    this.workflow = new Workflow(this.context);
    this.initialize();
  }

  initialize() {
    const scrollHandler = () => {
      if (this.workflow.pending) {
        return;
      }
      const lastScrollPosition = this.workflow.viewport.getLastPosition();
      const scrollPosition = this.workflow.viewport.scrollPosition;
      if (lastScrollPosition === scrollPosition) {
        return;
      }
      debouncedRound(() =>
        this.run(lastScrollPosition < scrollPosition ? Direction.forward : Direction.backward), 25
      );
    };

    this.onScrollListener = this.context.renderer.listen(this.workflow.viewport.scrollable, 'scroll', scrollHandler);

    this.workflow.buffer.$items.subscribe(items => this.context.items = items);

    this.workflow.resolver.subscribe(
      (next) => {
        if (next) {
          this.run();
        }
      },
      (error) => {
        throw error;
      }
    );

    this.run();
  }

  run(direction?: Direction) {
    if (this.workflow.pending) {
      // todo : keep last call ?
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
    return this.workflow.continue()
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
