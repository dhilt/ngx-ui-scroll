import { Observable } from 'rxjs/Observable';

import Mark from './processes/mark';
import Fetch from './processes/fetch';
import Process from './processes/process';

import { Elements } from './elements';
import { Data } from './data';

export class Workflow {

  // injected via constructor
  public elements: Elements;
  public data: Data;

  public resolver: Observable<any>;
  private observer;

  public shouldClip: boolean;

  public shouldLoadForward: boolean;
  public shouldLoadBackward: boolean;
  public newItemsForward: Array<any>;
  public newItemsBackward: Array<any>;

  constructor(
    elements: Elements,
    data: Data
  ) {
    this.elements = elements;
    this.data = data;

    this.resolver = Observable.create(_observer => {
      this.observer = _observer;
    });
  }

  static async run(workflow: Workflow) {

    Mark.run(workflow);
    await Fetch.run(workflow);

    // workflow.fail(false);
    workflow.done(true);
  }

  done(result: boolean) {
    this.observer.next(result);
    this.observer.complete();
  }

  fail(error: any) {
    this.observer.error(error);
  }

}

