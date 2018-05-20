import { Observable, Subscription } from 'rxjs';

import { Datasource } from './interfaces/index';
import { Settings } from './classes/settings';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';
import { Adapter } from './classes/adapter';

import { checkDatasource } from './utils/index';

let instanceCount = 0;

export class Scroller {

  readonly _bindData: Function;
  readonly callWorkflow: Function;
  private logs: Array<any> = [];

  public datasource: Datasource;
  public settings: Settings;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter: Adapter;

  public cycleSubscriptions: Array<Subscription>;
  public scrollDelaySubscription: Subscription;

  constructor(context, callWorkflow: Function) {
    // this._bindData = () => context.changeDetector.markForCheck();
    this._bindData = () => context.changeDetector.detectChanges();
    this.datasource = checkDatasource(context.datasource);
    this.callWorkflow = callWorkflow;

    this.settings = new Settings(context.datasource.settings, context.datasource.devSettings, ++instanceCount);
    this.routines = new Routines(this.settings);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines);
    this.buffer = new Buffer();
    this.state = new State();
    this.adapter = new Adapter(this.callWorkflow);

    this.datasource.adapter = this.adapter;
    this.cycleSubscriptions = [];
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

  purgeScrollDelaySubscription() {
    if (this.scrollDelaySubscription && !this.scrollDelaySubscription.closed) {
      this.scrollDelaySubscription.unsubscribe();
    }
  }

  dispose() {
    this.purgeCycleSubscriptions();
    this.purgeScrollDelaySubscription();
  }

  finalize() {
  }

  stat(str?) {
    if (this.settings.debug) {
      this.log((str ? str + ' — ' : '') +
        'top: ' + this.viewport.scrollPosition + ', ' +
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
