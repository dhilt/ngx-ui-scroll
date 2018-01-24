import { Observable } from 'rxjs/Observable';

import { Viewport } from './modules/viewport';
import { Settings } from './modules/settings';
import { Buffer } from './modules/buffer';
import { FetchModel, Datasource } from './models/index';

export class Workflow {

  public datasource: Datasource;
  public viewport: Viewport;
  public settings: Settings;
  public buffer: Buffer;

  // single cycle data
  public shouldClip: boolean;
  public fetch: FetchModel;

  public resolver: Observable<any>;
  private observer;

  constructor(context) {
    this.datasource = context.datasource;
    this.viewport = new Viewport(context.elementRef);
    this.settings = new Settings();
    this.buffer = new Buffer(context);
    this.reset();
  }

  dispose() {
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

