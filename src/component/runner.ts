import { Workflow } from './workflow';
import { debouncedRound } from './utils/index';

import ShouldFetch from './workflow/shouldFetch';
import Fetch from './workflow/fetch';
import ProcessFetch from './workflow/processFetch';
import Render from './workflow/render';
import AdjustFetch from './workflow/adjustFetch';

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
      debouncedRound(() => this.run(), 25);
      //this.run();
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

  run() {
    if (this.workflow.pending) {
      return;
    }
    this.workflow.start()
      .then(ShouldFetch.run)
      .then(Fetch.run)
      .then(ProcessFetch.run)
      .then(Render.run)
      .then(AdjustFetch.run)
      .then(() => {
        this.workflow.done();
      })
      .catch(error => {
        this.workflow.fail(error);
      });
  }

  dispose() {
    this.onScrollListener();
    this.workflow.dispose();
  }

}
