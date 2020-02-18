import { Observable, Subscription, Observer } from 'rxjs';

import { UiScrollComponent } from '../ui-scroll.component';
import { checkDatasource } from './utils/index';
import { Datasource } from './classes/datasource';
import { Settings } from './classes/settings';
import { Logger } from './classes/logger';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';
import { Adapter } from './classes/adapter';
import { ScrollerWorkflow, IAdapter } from './interfaces/index';

let instanceCount = 0;

export class Scroller {

  readonly runChangeDetector: Function;
  public workflow: ScrollerWorkflow;

  public datasource: Datasource;
  public settings: Settings;
  public logger: Logger;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter?: Adapter;

  public innerLoopSubscriptions: Array<Subscription>;

  constructor(context: UiScrollComponent, callWorkflow: Function) {
    const datasource = <Datasource>checkDatasource(context.datasource);

    this.runChangeDetector = () => context.changeDetector.markForCheck();
    // this.runChangeDetector = () => context.changeDetector.detectChanges();
    this.workflow = <ScrollerWorkflow>{ call: callWorkflow };
    this.innerLoopSubscriptions = [];

    this.settings = new Settings(datasource.settings, datasource.devSettings, ++instanceCount);
    this.logger = new Logger(this, context.version);
    this.routines = new Routines(this.settings);
    this.state = new State(this.settings, context.version, this.logger);
    this.buffer = new Buffer(this.settings, this.state.startIndex, this.logger);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines, this.state, this.logger);

    this.logger.object('uiScroll settings object', this.settings, true);

    // datasource & adapter initialization
    this.datasource = !datasource.constructed
      ? new Datasource(datasource, !this.settings.adapter)
      : datasource;
    if (datasource.constructed || this.settings.adapter) {
      this.adapter = new Adapter(this.datasource.adapter, this.state, this.buffer, this.workflow, this.logger);
    }
  }

  init() {
    this.viewport.reset(0);
    this.logger.stat('initialization');
  }

  bindData(): Observable<any> {
    this.runChangeDetector();
    return new Observable((observer: Observer<any>) => {
      setTimeout(() => {
        observer.next(true);
        observer.complete();
      });
    });
  }

  purgeInnerLoopSubscriptions() {
    this.innerLoopSubscriptions.forEach((item: Subscription) => item.unsubscribe());
    this.innerLoopSubscriptions = [];
  }

  purgeScrollTimers(localOnly?: boolean) {
    const { state: { scrollState } } = this;
    if (scrollState.scrollTimer) {
      clearTimeout(scrollState.scrollTimer);
      scrollState.scrollTimer = null;
    }
    if (!localOnly && scrollState.workflowTimer) {
      clearTimeout(scrollState.workflowTimer);
      scrollState.workflowTimer = null;
    }
  }

  dispose() {
    if (this.adapter) {
      this.adapter.dispose();
    }
    this.purgeInnerLoopSubscriptions();
    this.purgeScrollTimers();
  }

  finalize() {
  }

}
