import { Observable } from 'rxjs/Observable';

import { Elements } from './elements';
import { Data } from './data';
import { FetchModel } from './types';

export class Workflow {

  // injected via constructor
  public elements: Elements;
  public data: Data;

  // single cycle data
  public shouldClip: boolean;
  public fetch: FetchModel;

  public resolver: Observable<any>;
  private observer;

  constructor(
    elements: Elements,
    data: Data
  ) {
    this.elements = elements;
    this.data = data;
    this.reset();
  }

  done(result: boolean) {
    this.observer.next(result);
    this.observer.complete();
  }

  fail(error: any) {
    this.observer.error(error);
  }

  reset() {
    this.shouldClip = false;
    this.fetch = new FetchModel();

    this.resolver = Observable.create(_observer => {
      this.observer = _observer;
    });
  }

}

