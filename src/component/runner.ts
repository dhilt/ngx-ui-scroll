import { Workflow } from './workflow';

import ShouldFetch from './workflow/shouldFetch';
import Fetch from './workflow/fetch';
import ProcessFetch from './workflow/processFetch';
import Render from './workflow/render';
import AdjustFetch from './workflow/adjustFetch';

export class WorkflowRunner {

  static run(workflow: Workflow) {

    if (workflow.pending) {
      return;
    }

    workflow.start()
      .then(ShouldFetch.run)
      .then(Fetch.run)
      .then(ProcessFetch.run)
      .then(Render.run)
      .then(AdjustFetch.run)
      .then(() => {
        workflow.done();
      })
      .catch(error => {
        workflow.fail(error);
      });

  }

}
