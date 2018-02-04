import { Observable } from 'rxjs/Observable';

import { Datasource } from './interfaces/index';
import { Viewport } from './classes/viewport';
import { Settings } from './classes/settings';
import { Buffer } from './classes/buffer';
import { FetchModel } from './classes/fetch';
import { ClipModel } from './classes/clip';
import { Direction } from './interfaces/direction';

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
  public direction: Direction;
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
    this.pending = false;
    this.direction = null;
    this.next = false;
    this.fetch = new FetchModel();
    this.clip = new ClipModel();
  }

  start(direction?: Direction) {
    this.log(`---=== Workflow ${this.count} run`);
    this.reset();
    this.pending = true;
    this.count++;
    this.direction = direction || null;
    return Promise.resolve(this);
  }

  end() {
    this.pending = false;
    this.viewport.saveScrollPosition();
  }

  done() {
    this.log(`---=== Workflow ${this.count} done`);
    this.end();
    this.observer.next(this.next);
  }

  fail(error: any) {
    this.log(`---=== Workflow ${this.count} fail`);
    this.end();
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
