import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Datasource, Direction, Process, Run, ProcessSubject, AdapterActionType, AdapterAction } from './interfaces/index';
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
  private observer;
  public resolver$: Observable<any>;

  public datasource: Datasource;
  public settings: Settings;
  public routines: Routines;
  public viewport: Viewport;
  public buffer: Buffer;
  public state: State;
  public adapter: Adapter;

  public process$: BehaviorSubject<ProcessSubject>;
  public cycleSubscriptions: Array<Subscription>;
  private adapterResolverSubscription: Subscription;

  constructor(context) {
    this.resolver$ = Observable.create(observer => this.observer = observer);
    // this._bindData = () => context.changeDetector.markForCheck();
    this._bindData = () => context.changeDetector.detectChanges();
    this.datasource = checkDatasource(context.datasource);

    this.settings = new Settings(context.datasource.settings, context.datasource.devSettings);
    this.routines = new Routines(this.settings);
    this.viewport = new Viewport(context.elementRef, this.settings, this.routines);
    this.buffer = new Buffer();
    this.state = new State();
    this.adapter = new Adapter();

    this.datasource.adapter = this.adapter;
    this.cycleSubscriptions = [];
    this.adapterResolverSubscription = this.adapter.subject.subscribe(this.resolveAdapter.bind(this));
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

  dispose() {
    this.adapterResolverSubscription.unsubscribe();
    this.observer.complete();
    this.process$.complete();
    this.adapter.dispose();
    this.purgeCycleSubscriptions();
  }

  start(options: Run = {}) {
    this.state.startCycle(options);
    this.adapter.isLoading = true;
    this.log(`---=== Workflow ${this.state.cycleCount} start`, options);
    this.process$ = new BehaviorSubject(<ProcessSubject>{ process: Process.start });
  }

  end() {
    this.state.endCycle();
    this.adapter.isLoading = false;
    this.viewport.saveScrollPosition();
    this.process$.complete();
    this.purgeCycleSubscriptions();
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

  done(noNext?: boolean) {
    this.log(`---=== Workflow ${this.state.cycleCount} done`);
    this.end();
    this.observer.next(!noNext ? this.getNextRun() : {});
  }

  fail() {
    this.log(`---=== Workflow ${this.state.cycleCount} fail`);
    this.end();
  }

  resolveAdapter(data: AdapterAction) {
    this.log(`"${data.action}" action is triggered via Adapter`);
    switch (data.action) {
      case AdapterActionType.reload:
        this.reload(data.payload);
        return;
    }
  }

  reload(reloadIndex: number | string) {
    const scrollPosition = this.viewport.scrollPosition;
    this.buffer.reset(true);
    this.viewport.reset();
    this.viewport.syntheticScrollPosition = scrollPosition > 0 ? 0 : null;
    this.purgeCycleSubscriptions();

    this.settings.setCurrentStartIndex(reloadIndex);
    if (this.process$.isStopped) {
      this.observer.next({});
    } else {
      this.process$.next(<ProcessSubject>{
        stop: true,
        break: true
      });
    }
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
