import { Observable } from 'rxjs/Observable';

import { Datasource, Direction, Run } from './interfaces/index';
import { Settings } from './classes/settings';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { FetchModel } from './classes/fetch';
import { ClipModel } from './classes/clip';

import { checkDatasource } from './utils/index';

export class Workflow {

  private observer;
  public resolver: Observable<any>;

  public bindData: Function;
  public datasource: Datasource;
  public settings: Settings;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;

  public count = 0;
  public countDone = 0;
  public pending: boolean;
  public direction: Direction;
  public scroll: boolean;
  public fetch: FetchModel;
  public clip: ClipModel;

  private next: Run;
  private logs: Array<any> = [];

  constructor(context) {
    this.resolver = Observable.create(_observer => this.observer = _observer);

    this.bindData = () => {
      context.changeDetector.markForCheck();
    };
    this.datasource = checkDatasource(context.datasource);

    this.settings = new Settings(context.datasource.settings, context.datasource.devSettings);
    this.routines = new Routines(this.settings);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines);
    this.buffer = new Buffer();

    this.fetch = new FetchModel();
    this.clip = new ClipModel();
  }

  start(options: Run = {}) {
    this.count++;
    this.log(`---=== Workflow ${this.count} run`, options);
    this.pending = true;
    this.direction = options.direction;
    this.scroll = options.scroll || false;
    this.fetch.reset();
    this.clip.reset();
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

  analyse() {
    this.next = null;
    if (this.fetch.hasNewItems || this.clip.shouldClip) {
      this.next = { direction: this.direction, scroll: this.scroll };
    }
    if (!this.buffer.size && this.fetch.shouldFetch && !this.fetch.hasNewItems) {
      this.next = {
        direction: this.direction === Direction.forward ? Direction.backward : Direction.forward,
        scroll: false
      };
    }
  }

  done() {
    this.log(`---=== Workflow ${this.count} done`);
    this.end();
    this.analyse();
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

  stat(str?) {
    if (this.settings.debug) {
      this.log((str ? str + ' — ' : '') +
        'scroll: ' + this.viewport.scrollPosition + ', ' +
        'bwd_p: ' + this.viewport.padding.backward.size + ', ' +
        'fwd_p: ' + this.viewport.padding.forward.size + ', ' +
        'items: ' + this.buffer.size
      );
    }
  }

  log(...args) {
    if (this.settings.debug) {
      if (this.settings.immediateLog) {
        console.log.apply(this, args);
      } else {
        this.logs.push(args);
      }
    }
  }

  logForce(...args) {
    if (this.settings.debug) {
      if (!this.settings.immediateLog && this.logs.length) {
        this.logs.forEach(logArgs => console.log.apply(this, logArgs));
        this.logs = [];
      }
      if (args.length) {
        console.log.apply(this, args);
      }
    }
  }

}
