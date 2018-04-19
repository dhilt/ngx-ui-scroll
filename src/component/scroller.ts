import { Observable } from 'rxjs/Observable';

import { Datasource, Direction, Run } from './interfaces/index';
import { Settings } from './classes/settings';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';
import { Adapter } from './classes/adapter';

import { checkDatasource } from './utils/index';

export class Scroller {

  private observer;
  public resolver$: Observable<any>;

  public bindData: Function;
  public datasource: Datasource;
  public settings: Settings;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter: Adapter;

  private next: Run;
  private logs: Array<any> = [];

  constructor(context) {
    this.resolver$ = Observable.create(observer => this.observer = observer);

    this.bindData = () => context.changeDetector.markForCheck();
    this.datasource = checkDatasource(context.datasource);

    this.settings = new Settings(context.datasource.settings, context.datasource.devSettings);
    this.routines = new Routines(this.settings);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines);
    this.buffer = new Buffer();
    this.state = new State();
    this.adapter = new Adapter();

    this.datasource.adapter = this.adapter;
  }

  start(options: Run = {}) {
    this.state.countStart++;
    this.log(`---=== Workflow ${this.state.countStart} run`, options);
    this.state.pending = true;
    this.state.direction = options.direction;
    this.state.scroll = options.scroll || false;
    this.state.fetch.reset();
    this.state.clip.reset();
    return Promise.resolve(this);
  }

  continue() {
    return Promise.resolve(this);
  }

  finalize() { // stop 1 cycle
  }

  end() {
    this.state.pending = false;
    this.state.countDone++;
    this.viewport.saveScrollPosition();
    this.finalize();
  }

  setNext() {
    this.next = null;
    if (this.state.fetch.hasNewItems || this.state.clip.shouldClip) {
      this.next = { direction: this.state.direction, scroll: this.state.scroll };
    }
    if (!this.buffer.size && this.state.fetch.shouldFetch && !this.state.fetch.hasNewItems) {
      this.next = {
        direction: this.state.direction === Direction.forward ? Direction.backward : Direction.forward,
        scroll: false
      };
    }
  }

  done() {
    this.log(`---=== Workflow ${this.state.countStart} done`);
    this.end();
    this.setNext();
    this.observer.next(this.next);
  }

  fail(error: any) {
    this.log(`---=== Workflow ${this.state.countStart} fail`);
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
