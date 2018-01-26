import { Observable } from 'rxjs/Observable';

import { Viewport } from './modules/viewport';
import { Settings } from './modules/settings';
import { Buffer } from './modules/buffer';
import { FetchModel, Datasource } from './models/index';

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

