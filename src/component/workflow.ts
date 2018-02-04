import { Observable } from 'rxjs/Observable';

import { Datasource } from './interfaces/index';
import { Viewport } from './classes/viewport';
import { Settings } from './classes/settings';
import { Buffer } from './classes/buffer';
import { FetchModel } from './classes/fetch';
import { ClipModel } from './classes/clip';

export class Workflow {

  private observer;
  public resolver: Observable<any>;

  private debug: boolean;
  public bindData: Function;

  public datasource: Datasource;
  public viewport: Viewport;
  public settings: Settings;
  public buffer: Buffer;

  // single cycle data (resettable)
  public count = 0;
  public pending: boolean;
  public next: boolean;
  public fetch: FetchModel;
  public clip: ClipModel;

  constructor(context) {
    this.debug = true;
    this.resolver = Observable.create(_observer => this.observer = _observer);

    this.bindData = () => context.changeDetector.markForCheck();
    this.datasource = context.datasource;

    this.viewport = new Viewport(context.elementRef);
    this.settings = new Settings();
    this.buffer = new Buffer();
  }

  reset() {
    this.count++;
    this.pending = false;
    this.next = false;
    this.fetch = new FetchModel();
    this.clip = new ClipModel();
  }

  start() {
    this.log(`---=== Workflow ${this.count} run`);
    this.reset();
    return Promise.resolve(this);
  }

  done() {
    this.log(`---=== Workflow ${this.count} done`);
    this.pending = false;
    this.observer.next(this.next);
  }

  fail(error: any) {
    this.log(`---=== Workflow ${this.count} fail`);
    this.pending = false;
    this.observer.error(error);
  }

  dispose() {
    this.observer.complete();
  }

  log(...args) {
    if(this.debug) {
      console.log.apply(this, args);
    }
  }

}
