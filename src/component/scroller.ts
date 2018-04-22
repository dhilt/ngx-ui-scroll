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

  dispose() {
    this.observer.complete();
    this.adapter.dispose();
  }

  start(options: Run = {}) {
    this.state.startCycle(options);
    this.log(`---=== Workflow ${this.state.cycleCount} start`, options);
    return Promise.resolve(this);
  }

  end() {
    this.state.endCycle();
    this.viewport.saveScrollPosition();
    this.finalize();
  }

  finalize() {
  }

  continue() {
    return Promise.resolve(this);
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
    this.log(`---=== Workflow ${this.state.cycleCount} done`);
    this.end();
    this.setNext();
    this.observer.next(this.next);
  }

  fail(error: any) {
    this.log(`---=== Workflow ${this.state.cycleCount} fail`);
    this.end();
    this.observer.error(error);
  }

  reload(startIndex: number) {
    const scrollPosition = this.viewport.scrollPosition;
    this.settings.setCurrentStartIndex(startIndex);
    this.buffer.reset(true);
    this.viewport.reset();
    this.viewport.syntheticScrollPosition = scrollPosition > 0 ? 0 : null;
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
