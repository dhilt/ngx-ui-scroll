import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import {
  Datasource,
  Direction,
  Process,
  Run,
  ProcessSubject,
  AdapterActionType,
  AdapterAction
} from './interfaces/index';
import { Settings } from './classes/settings';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';
import { Adapter } from './classes/adapter';

import { checkDatasource } from './utils/index';

export class Scroller {

  readonly _bindData: Function;
  private logs: Array<any> = [];

  public datasource: Datasource;
  public settings: Settings;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter: Adapter;

  public process$: BehaviorSubject<ProcessSubject>;
  public cycleSubscriptions: Array<Subscription>;
  public scrollSubscription: Subscription;

  constructor(context) {
    // this._bindData = () => context.changeDetector.markForCheck();
    this._bindData = () => context.changeDetector.detectChanges();
    this.datasource = checkDatasource(context.datasource);

    this.settings = new Settings(context.datasource.settings, context.datasource.devSettings);
    this.routines = new Routines(this.settings);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines);
    this.buffer = new Buffer();
    this.state = new State();
    this.adapter = new Adapter(() => this.process$);

    this.datasource.adapter = this.adapter;
    this.cycleSubscriptions = [];

    this.process$ = new BehaviorSubject(<ProcessSubject>{
      process: Process.init,
      status: 'start'
    });
  }

  bindData(): Observable<any> {
    this._bindData();
    return Observable.create(observer => {
        setTimeout(() => {
          observer.next();
          observer.complete();
        });
      }
    );
  }

  purgeCycleSubscriptions() {
    this.cycleSubscriptions.forEach((item: Subscription) => item.unsubscribe());
    this.cycleSubscriptions = [];
  }

  purgeScrollSubscription() {
    if (this.scrollSubscription && !this.scrollSubscription.closed) {
      this.scrollSubscription.unsubscribe();
    }
  }

  dispose() {
    this.process$.complete();
    this.adapter.dispose();
    this.purgeCycleSubscriptions();
    this.purgeScrollSubscription();
  }

  finalize() {
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
