import { Workflow } from './workflow';

import ShouldFetch from './workflow/shouldFetch';
import Fetch from './workflow/fetch';
import ProcessFetch from './workflow/processFetch';
import Render from './workflow/render';
import AdjustFetch from './workflow/adjustFetch';

export class WorkflowRunner {

  static async run(workflow: Workflow) {

    console.log('Workflow started');

    if(workflow.isRunning()) {
      return;
    }

    workflow.start()
      .then(ShouldFetch.run)
      .then(Fetch.run)
      .then(ProcessFetch.run)
      .then(Render.run)
      //.then(AdjustFetch.run)
      .then(() => {
        workflow.done(true);
      })
      .catch(error => {
        workflow.fail(false);
        console.log(error);
      })

  }

}
