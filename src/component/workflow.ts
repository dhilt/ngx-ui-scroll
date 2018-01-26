import { Observable } from 'rxjs/Observable';

import { Datasource } from './interfaces/index';
import { Viewport } from './classes/viewport';
import { Settings } from './classes/settings';
import { Buffer } from './classes/buffer';
import { FetchModel } from './classes/fetch';

export class Workflow {

  private observer;
  public resolver: Observable<any>;

  public disabledScroll: boolean;
  public bindData: Function;

  public datasource: Datasource;
  public viewport: Viewport;
  public settings: Settings;
  public buffer: Buffer;

  // single cycle data
  public shouldClip: boolean;
  public fetch: FetchModel;
  public next: boolean;
  public pending: boolean;
  public count = 0;

  constructor(context) {
    this.resolver = Observable.create(_observer => this.observer = _observer);

    this.bindData = () => context.changeDetector.markForCheck();
    this.datasource = context.datasource;

    this.viewport = new Viewport(context.elementRef, () => this.disabledScroll = true);
    this.settings = new Settings();
    this.buffer = new Buffer();
  }

  reset() {
    this.shouldClip = false;
    this.next = false;
    this.fetch = new FetchModel();
  }

  start() {
    this.count++;
    console.log(`---=== Workflow ${this.count} run`);
    this.reset();
    this.pending = true;
    return Promise.resolve(this);
  }

  done() {
    console.log(`---=== Workflow ${this.count} done`);
    this.pending = false;
    this.observer.next(this.next);
  }

  fail(error: any) {
    console.log(`---=== Workflow ${this.count} fail`);
    this.pending = false;
    this.observer.error(error);
  }

  dispose() {
    this.observer.complete();
  }

}
