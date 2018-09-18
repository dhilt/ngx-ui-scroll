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
import { Direction } from './interfaces';

let instanceCount = 0;

export class Scroller {

  readonly runChangeDetector: Function;
  readonly callWorkflow: Function;

  public version: string;
  public datasource: Datasource;
  public settings: Settings;
  public logger: Logger;
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
    this.logger = new Logger(this);
    this.routines = new Routines(this.settings);
    this.state = new State(this.settings, this.logger);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines, this.state, this.logger);
    this.buffer = new Buffer(this.settings);

    if (!datasource.constructed) {
      this.datasource = new Datasource(datasource, !this.settings.adapter);
      if (this.settings.adapter) {
        this.datasource.adapter.initialize(this);
      }
    } else {
      this.datasource.adapter.initialize(this);
    }

    this.logger.stat('initialization');
    this.logger.log(() => ['uiScroll settings object', this.settings]);
    // this.logger.log(() => ['uiScroll settings object',
    //   JSON.stringify(this.settings)
    //     .replace(/"/g, '')
    //     .replace(/(\{|\:|\,)/g, '$1 ')
    // ]);
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

  getScrollDirection(): Direction {
    const position = this.viewport.scrollPosition;
    let lastPosition = this.state.lastPosition;
    let direction: Direction, notChanged = false;
    if (position === lastPosition) {
      lastPosition = this.state.preFetchPosition;
      if (position === lastPosition) {
        notChanged = true;
      }
    }
    direction = notChanged ? Direction.forward :
      position < lastPosition ? Direction.backward : Direction.forward;
    this.logger.log(() =>
      `scroll direction: ${direction}, position: ${position}` + (notChanged ? '(has not been changed)' : '')
    );
    return direction;
  }

  dispose() {
    this.purgeCycleSubscriptions();
  }

  finalize() {
  }

}
