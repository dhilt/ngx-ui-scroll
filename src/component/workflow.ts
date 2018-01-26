import { Observable } from 'rxjs/Observable';

import { Viewport } from './classes/viewport';
import { Settings } from './classes/settings';
import { Buffer } from './classes/buffer';
import { Datasource } from './interfaces/index';
import { FetchModel } from './classes/fetch';

export class Workflow {

  public disabledScroll: boolean;

  public bindData: Function;
  public datasource: Datasource;
  public viewport: Viewport;
  public settings: Settings;
  public buffer: Buffer;

  // single cycle data
  public shouldClip: boolean;
  public fetch: FetchModel;

  public resolver: Observable<any>;
  private observer;
  private pending: boolean;

  constructor(context) {
    this.bindData = () => context.changeDetector.markForCheck();
    this.datasource = context.datasource;

    this.viewport = new Viewport(context.elementRef, () => this.disabledScroll = true);
    this.settings = new Settings();
    this.buffer = new Buffer();

    this.resolver = Observable.create(_observer => {
      this.observer = _observer;
    });
  }

  dispose() {
  }

  start() {
    this.reset();
    this.pending = true;
    return Promise.resolve(this);
  }

  isRunning(): boolean {
    return !!this.pending;
  }

  done(result: boolean) {
    this.pending = false;
    this.observer.next(result);
    this.observer.complete();
  }

  fail(error: any) {
    this.pending = false;
    this.observer.error(error);
  }

  reset() {
    this.shouldClip = false;
    this.fetch = new FetchModel();
  }

}

