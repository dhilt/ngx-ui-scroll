import { Observable } from 'rxjs/Observable';

import { Datasource, Direction, Run, Previous } from './interfaces/index';
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
  public next: boolean;
  public fetch: FetchModel;
  public clip: ClipModel;
  public previous: Previous;

  private logs: Array<any> = [];

  constructor(context) {
    this.resolver = Observable.create(_observer => this.observer = _observer);

    this.bindData = () => {
      this.next = true;
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
    this.log(`---=== Workflow ${this.count} run`);
    this.next = false;
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
    if (this.clip.shouldClip) {
      this.previous = {
        backwardClipSize: this.clip[Direction.backward].size,
        forwardClipSize: this.clip[Direction.forward].size,
        direction: this.direction
      };
    }
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
