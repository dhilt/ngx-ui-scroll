import { Observable } from 'rxjs/Observable';

import { Elements } from './elements';
import { Settings } from './settings';
import { Buffer } from './buffer';
import { FetchModel, Datasource } from './types';

export class Workflow {

  // injected via constructor
  public elements: Elements;
  public settings: Settings;
  public datasource: Datasource;
  public buffer: Buffer;

  // single cycle data
  public shouldClip: boolean;
  public fetch: FetchModel;

  public resolver: Observable<any>;
  private observer;

  constructor(context) {
    this.elements = new Elements(context.elementRef);
    this.settings = new Settings();
    this.buffer = new Buffer(context.datasource, context);
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

