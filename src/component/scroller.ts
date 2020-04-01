import { Observable, Subscription, Observer, Subject } from 'rxjs';

import { Datasource } from './classes/datasource';
import { Settings } from './classes/settings';
import { Logger } from './classes/logger';
import { Routines } from './classes/domRoutines';
import { Viewport } from './classes/viewport';
import { Buffer } from './classes/buffer';
import { State } from './classes/state';
import { Adapter } from './classes/adapter';
import { checkDatasource } from './utils/index';

import { ScrollerWorkflow, IDatasource, CallWorkflow } from './interfaces/index';

let instanceCount = 0;

export class Scroller {
  public workflow: ScrollerWorkflow;

  public datasource: Datasource;
  public settings: Settings;
  public logger: Logger;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter: Adapter;

  public innerLoopSubscriptions: Subscription[];

  constructor(
    element: HTMLElement,
    datasource: Datasource | IDatasource,
    version: string,
    callWorkflow: CallWorkflow,
    scroller?: Scroller // for re-initialization
  ) {
    checkDatasource(datasource);

    const $items = scroller ? scroller.buffer.$items : void 0;
    this.workflow = { call: callWorkflow };
    this.innerLoopSubscriptions = [];

    this.settings = new Settings(datasource.settings, datasource.devSettings, ++instanceCount);
    this.logger = new Logger(this, version);
    this.routines = new Routines(this.settings);
    this.state = new State(this.settings, version, this.logger);
    this.buffer = new Buffer(this.settings, this.state.startIndex, this.logger, $items);
    this.viewport = new Viewport(element, this.settings, this.routines, this.state, this.logger);
    this.logger.object('uiScroll settings object', this.settings, true);

    this.initDatasource(datasource, scroller);
  }

  initDatasource(datasource: Datasource | IDatasource, scroller?: Scroller) {
    if (scroller) { // scroller re-instantiating case
      this.datasource = datasource as Datasource;
      this.adapter = scroller.adapter;
      // todo: what about (this.settings.adapter !== scroller.setting.adapter) case?
      return;
    }
    // scroller is being instantiated for the first time
    const constructed = datasource instanceof Datasource;
    const mockAdapter = !constructed && !this.settings.adapter;
    if (!constructed) { // datasource as POJO case
      this.datasource = new Datasource(datasource, mockAdapter);
      if (this.settings.adapter) {
        datasource.adapter = this.datasource.adapter;
      }
    } else { // instantiated datasource case
      this.datasource = datasource as Datasource;
    }
    const publicContext = !mockAdapter ? this.datasource.adapter : null;
    this.adapter = new Adapter(publicContext, () => this.workflow, this.logger);
  }

  init(dispose$: Subject<void>) {
    this.viewport.reset(0);
    this.logger.stat('initialization');
    this.adapter.init(this.state, this.buffer, this.logger, dispose$);
  }

  bindData(): Observable<void> {
    return new Observable((observer: Observer<void>) => {
      setTimeout(() => {
        observer.next();
        observer.complete();
      });
    });
  }

  purgeSubscriptions(localOnly = false) {
    this.innerLoopSubscriptions.forEach((item: Subscription) => item.unsubscribe());
    this.innerLoopSubscriptions = [];
  }

  purgeScrollTimers(localOnly = false) {
    const { state: { scrollState } } = this;
    if (scrollState.scrollTimer) {
      clearTimeout(scrollState.scrollTimer);
      scrollState.scrollTimer = null;
    }
    if (!localOnly && scrollState.workflowTimer) {
      clearTimeout(scrollState.workflowTimer);
      scrollState.workflowTimer = null;
    }
    if (!localOnly && scrollState.animationFrameId) {
      cancelAnimationFrame(scrollState.animationFrameId);
      scrollState.animationFrameId = 0;
    }
  }

  dispose(forever?: boolean) {
    if (this.adapter && forever) {
      this.adapter.dispose();
    }
    this.buffer.dispose(forever);
    this.purgeSubscriptions();
    this.purgeScrollTimers();
  }

  finalize() {
  }

}
