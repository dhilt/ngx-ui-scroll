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
import { ScrollerWorkflow } from './interfaces/index';

let instanceCount = 0;

export class Scroller {

  readonly runChangeDetector: Function;
  public workflow: ScrollerWorkflow;

  public version: string;
  public datasource: Datasource;
  public settings: Settings;
  public logger: Logger;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;

  public innerLoopSubscriptions: Array<Subscription>;

  constructor(context: UiScrollComponent, callWorkflow: Function) {
    const datasource = <Datasource>checkDatasource(context.datasource);
    this.datasource = datasource;
    this.version = context.version;

    this.runChangeDetector = () => context.changeDetector.markForCheck();
    // this.runChangeDetector = () => context.changeDetector.detectChanges();
    this.workflow = <ScrollerWorkflow>{ call: callWorkflow };
    this.innerLoopSubscriptions = [];

    this.settings = new Settings(datasource.settings, datasource.devSettings, ++instanceCount);
    this.logger = new Logger(this);
    this.routines = new Routines(this.settings);
    this.state = new State(this.settings, this.logger);
    this.buffer = new Buffer(this.settings, this.state.startIndex, this.logger);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines, this.state, this.logger);

    this.logger.object('uiScroll settings object', this.settings, true);

    this.datasourceInit();
  }

  init() {
    this.viewport.reset(0);
  }

  datasourceInit() {
    const { datasource, settings } = this;
    if (!datasource.constructed) {
      this.datasource = new Datasource(datasource, !settings.adapter);
      if (settings.adapter) {
        this.datasource.adapter.initialize(this);
        datasource.adapter = this.datasource.adapter;
      }
    } else {
      this.datasource.adapter.initialize(this);
    }
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
    this.purgeInnerLoopSubscriptions();
    this.purgeScrollTimers();
  }

  finalize() {
  }

}
