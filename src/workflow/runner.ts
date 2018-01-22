import { Observable } from 'rxjs/Observable';

import { Workflow } from './workflow';

import Mark from './processes/mark';
import ShouldFetch from './processes/shouldFetch';
import Fetch from './processes/fetch';
import ProcessFetch from './processes/processFetch';
import Process from './processes/process';

export class WorkflowRunner {

  static async run(workflow: Workflow) {

    ShouldFetch.run(workflow);
    await Fetch.run(workflow);
    ProcessFetch.run(workflow);

    // workflow.fail(false);
    workflow.done(true);
  }

}
