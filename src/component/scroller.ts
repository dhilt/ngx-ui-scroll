import { Observable, Subscription, Observer } from 'rxjs';

import { UiScrollComponent } from '../ui-scroll.component';
import { Datasource } from './interfaces/index';
import { checkDatasource } from './utils/index';
import { Settings } from './classes/settings';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';
import { Adapter } from './classes/adapter';

let instanceCount = 0;

export class Scroller {

  readonly _bindData: Function;
  readonly callWorkflow: Function;
  private logs: Array<any> = [];

  public version: string;
  public datasource: Datasource;
  public settings: Settings;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter: Adapter;

  public cycleSubscriptions: Array<Subscription>;

  constructor(context: UiScrollComponent, callWorkflow: Function) {
    // this._bindData = () => context.changeDetector.markForCheck();
    this._bindData = () => context.changeDetector.detectChanges();
    this.version = context.version;
    this.datasource = checkDatasource(context.datasource);
    this.callWorkflow = callWorkflow;

    this.settings = new Settings(context.datasource.settings, context.datasource.devSettings, ++instanceCount);
    this.routines = new Routines(this.settings);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines);
    this.buffer = new Buffer(this.settings);
    this.state = new State(this.settings.startIndex);
    this.adapter = new Adapter(this);

    this.datasource.adapter = this.adapter;
    this.cycleSubscriptions = [];
  }

  bindData(): Observable<any> {
    this._bindData();
    return Observable.create((observer: Observer<any>) => {
        setTimeout(() => {
          observer.next(true);
          observer.complete();
        });
      }
    );
  }

  purgeCycleSubscriptions() {
    this.cycleSubscriptions.forEach((item: Subscription) => item.unsubscribe());
    this.cycleSubscriptions = [];
  }

  dispose() {
    this.purgeCycleSubscriptions();
  }

  finalize() {
  }

  stat(str?: string) {
    if (this.settings.debug) {
      this.log((str ? str + ' — ' : '') +
        'top: ' + this.viewport.scrollPosition + ', ' +
        'bwd_p: ' + this.viewport.padding.backward.size + ', ' +
        'fwd_p: ' + this.viewport.padding.forward.size + ', ' +
        'items: ' + this.buffer.size
      );
    }
  }

  log(...args: Array<any>) {
    if (this.settings.debug) {
      if (this.settings.immediateLog) {
        console.log.apply(this, args);
      } else {
        this.logs.push(args);
      }
    }
  }

  logForce(...args: Array<any>) {
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
