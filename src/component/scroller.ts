import { Observable } from 'rxjs/Observable';

import { Datasource, Direction, Run } from './interfaces/index';
import { Settings } from './classes/settings';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';
import { Adapter } from './classes/adapter';

import { checkDatasource } from './utils/index';
import { ActionType } from './interfaces/adapter';

export class Scroller {

  public resolver$: Observable<any>;
  private observer;
  private _bindData: Function;
  private logs: Array<any> = [];

  public datasource: Datasource;
  public settings: Settings;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter: Adapter;

  constructor(context) {
    this._bindData = () => context.changeDetector.markForCheck();
    this.resolver$ = Observable.create(observer => this.observer = observer);
    this.datasource = checkDatasource(context.datasource);

    this.settings = new Settings(context.datasource.settings, context.datasource.devSettings);
    this.routines = new Routines(this.settings);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines);
    this.buffer = new Buffer();
    this.state = new State();
    this.adapter = new Adapter();

    this.datasource.adapter = this.adapter;
  }

  bindData(): Promise<any> {
    this._bindData();
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (this.state.reload) {
          return reject(ActionType.reload);
        }
        resolve(this);
      })
    );
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

  getNextRun(): Run {
    let next = null;
    if (this.state.fetch.hasNewItems || this.state.clip.shouldClip) {
      next = { direction: this.state.direction, scroll: this.state.scroll };
    }
    if (!this.buffer.size && this.state.fetch.shouldFetch && !this.state.fetch.hasNewItems) {
      next = {
        direction: this.state.direction === Direction.forward ? Direction.backward : Direction.forward,
        scroll: false
      };
    }
    return next;
  }

  done(caught?) {
    this.end();
    if (!caught) {
      this.log(`---=== Workflow ${this.state.cycleCount} done`);
      this.observer.next(this.getNextRun());
      return;
    }
    if (caught instanceof Error) {
      this.log(`---=== Workflow ${this.state.cycleCount} fail`);
      console.error(caught);
      this.observer.next();
      return;
    }
    if (caught === ActionType.reload) {
      this.log(`---=== Workflow ${this.state.cycleCount} break`);
      return;
    }
  }

  reload(startIndex: number) {
    const scrollPosition = this.viewport.scrollPosition;
    this.buffer.reset(true);
    this.viewport.reset();
    this.viewport.syntheticScrollPosition = scrollPosition > 0 ? 0 : null;

    this.settings.setCurrentStartIndex(startIndex);
    this.state.reload = true;
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
