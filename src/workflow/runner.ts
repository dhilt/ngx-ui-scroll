import { Workflow } from './workflow';

import ShouldFetch from './processes/shouldFetch';
import Fetch from './processes/fetch';
import ProcessFetch from './processes/processFetch';

export class WorkflowRunner {

  static async run(workflow: Workflow) {

    ShouldFetch.run(workflow);
    await Fetch.run(workflow);
    ProcessFetch.run(workflow);

    // workflow.fail(false);
    workflow.done(true);
  }

}
