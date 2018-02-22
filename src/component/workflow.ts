import { Observable } from 'rxjs/Observable';

import { Datasource, Direction } from './interfaces';
import { Settings } from './classes/settings';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { FetchModel } from './classes/fetch';
import { ClipModel } from './classes/clip';

import { checkDatasource } from './utils';

export class Workflow {

  private observer;
  public resolver: Observable<any>;

  public bindData: Function;
  public datasource: Datasource;
  public settings: Settings;
  public viewport: Viewport;
  public buffer: Buffer;

  public count = 0;
  public countDone = 0;
  public pending: boolean;
  public direction: Direction;
  public next: boolean;
  public fetch: FetchModel;
  public clip: ClipModel;

  constructor(context) {
    this.resolver = Observable.create(_observer => this.observer = _observer);

    this.bindData = () => {
      this.next = true;
      context.changeDetector.markForCheck();
    };
    this.datasource = checkDatasource(context.datasource);

    this.settings = new Settings(context.datasource.settings);
    this.viewport = new Viewport(context.elementRef, this.settings);
    this.buffer = new Buffer();

    this.fetch = new FetchModel();
    this.clip = new ClipModel();
  }

  reset() {
    this.pending = false;
    this.viewport.syntheticScroll = false;
    this.direction = null;
    this.next = false;
    this.fetch.reset();
    this.clip = new ClipModel();
  }

  start(direction?: Direction) {
    this.count++;
    this.log(`---=== Workflow ${this.count} run`);
    this.reset();
    this.pending = true;
    this.direction = direction || null;
    return Promise.resolve(this);
  }

  continue() {
    return Promise.resolve(this);
  }

  finalize() { // stop 1 cycle
  }

  end() {
    this.pending = false;
    this.countDone++;
    this.viewport.saveScrollPosition();
    this.finalize();
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
    if (this.settings.debug) {
      console.log.apply(this, args);
    }
  }

}
