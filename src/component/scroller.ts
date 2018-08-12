import { Observable, Subscription, Observer } from 'rxjs';

import { UiScrollComponent } from '../ui-scroll.component';
import { checkDatasource } from './utils/index';
import { Datasource } from './classes/datasource';
import { Settings } from './classes/settings';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';

let instanceCount = 0;

export class Scroller {

  readonly runChangeDetector: Function;
  readonly callWorkflow: Function;
  private logs: Array<any> = [];

  public version: string;
  public datasource: Datasource;
  public settings: Settings;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;

  public cycleSubscriptions: Array<Subscription>;

  constructor(context: UiScrollComponent, callWorkflow: Function) {
    const datasource = <Datasource>checkDatasource(context.datasource);
    this.datasource = datasource;
    this.version = context.version;

    this.runChangeDetector = () => context.changeDetector.markForCheck();
    // this.runChangeDetector = () => context.changeDetector.detectChanges();
    this.callWorkflow = callWorkflow;
    this.cycleSubscriptions = [];

    this.settings = new Settings(datasource.settings, datasource.devSettings, ++instanceCount);
    this.routines = new Routines(this.settings);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines);
    this.buffer = new Buffer(this.settings);
    this.state = new State(this.settings.startIndex);

    if (!datasource.constructed) {
      this.datasource = new Datasource(datasource, !this.settings.adapter);
      if (this.settings.adapter) {
        this.datasource.adapter.initialize(this);
      }
    } else {
      this.datasource.adapter.initialize(this);
    }
  }

  bindData(): Observable<any> {
    this.runChangeDetector();
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
      this.log((str ? str + ', ' : '') +
        'top: ' + this.viewport.scrollPosition + ', ' +
        'size: ' + this.viewport.getScrollableSize() + ', ' +
        'bwd_p: ' + this.viewport.padding.backward.size + ', ' +
        'fwd_p: ' + this.viewport.padding.forward.size + ', ' +
        'items: ' + this.datasource.adapter.itemsCount
      );
    }
  }

  log(...args: Array<any>) {
    if (this.settings.logTime) {
      args = [...args, ` // time:`, this.state.time];
    }
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
