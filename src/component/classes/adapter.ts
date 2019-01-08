import { BehaviorSubject, Observable, Observer, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Adapter as IAdapter, Process, ProcessSubject, ProcessStatus, ItemAdapter } from '../interfaces/index';
import { Scroller } from '../scroller';

const getIsInitialized = (adapter: Adapter): Observable<boolean> =>
  Observable.create((observer: Observer<boolean>) => {
    const intervalId = setInterval(() => {
      if (adapter && adapter.init) {
        clearInterval(intervalId);
        observer.next(true);
        observer.complete();
      }
    }, 25);
  });

const getInitializedSubject = (adapter: Adapter, method: Function): BehaviorSubject<any> => {
  return adapter.init ? method() :
    adapter.init$
      .pipe(switchMap(() =>
        method()
      ));
};

export const itemAdapterEmpty = <ItemAdapter> {
  data: {},
  element: {}
};

export const generateMockAdapter = (): IAdapter => (
  <IAdapter> {
    version: null,
    init: false,
    init$: observableOf(false),
    isLoading: false,
    isLoading$: new BehaviorSubject<boolean>(false),
    cyclePending: false,
    cyclePending$: new BehaviorSubject<boolean>(false),
    loopPending: false,
    loopPending$: new BehaviorSubject<boolean>(false),
    firstVisible: itemAdapterEmpty,
    firstVisible$: new BehaviorSubject<ItemAdapter>(itemAdapterEmpty),
    lastVisible: itemAdapterEmpty,
    lastVisible$: new BehaviorSubject<ItemAdapter>(itemAdapterEmpty),
    itemsCount: 0,
    bof: false,
    eof: false,
    initialize: () => null,
    reload: () => null,
    append: () => null,
    prepend: () => null,
    showLog: () => null,
    setMinIndex: () => null,
    setScrollPosition: () => null
  }
);

export class Adapter implements IAdapter {

  get init(): boolean {
    return this.isInitialized;
  }

  get init$(): Observable<boolean> {
    return getIsInitialized(this);
  }

  get version(): string | null {
    return this.isInitialized ? this.getVersion() : null;
  }

  get isLoading(): boolean {
    return this.isInitialized ? this.getIsLoading() : false;
  }

  get isLoading$(): BehaviorSubject<boolean> {
    return getInitializedSubject(this, () => this.getIsLoading$());
  }

  get loopPending(): boolean {
    return this.isInitialized ? this.getLoopPending() : false;
  }

  get loopPending$(): BehaviorSubject<boolean> {
    return getInitializedSubject(this, () => this.getLoopPending$());
  }

  get cyclePending(): boolean {
    return this.isInitialized ? this.getCyclePending() : false;
  }

  get cyclePending$(): BehaviorSubject<boolean> {
    return getInitializedSubject(this, () => this.getCyclePending$());
  }

  get firstVisible(): ItemAdapter {
    return this.isInitialized ? this.getFirstVisible() : {};
  }

  get firstVisible$(): BehaviorSubject<ItemAdapter> {
    return getInitializedSubject(this, () => this.getFirstVisible$());
  }

  get lastVisible(): ItemAdapter {
    return this.isInitialized ? this.getLastVisible() : {};
  }

  get lastVisible$(): BehaviorSubject<ItemAdapter> {
    return getInitializedSubject(this, () => this.getLastVisible$());
  }

  get itemsCount(): number {
    return this.isInitialized ? this.getItemsCount() : 0;
  }

  get bof(): boolean {
    return this.isInitialized ? this.getBOF() : false;
  }

  get eof(): boolean {
    return this.isInitialized ? this.getEOF() : false;
  }

  private scroller: Scroller;
  private isInitialized: boolean;
  private callWorkflow: Function;
  private getVersion: Function;
  private getIsLoading: Function;
  private getIsLoading$: Function;
  private getCyclePending: Function;
  private getCyclePending$: Function;
  private getLoopPending: Function;
  private getLoopPending$: Function;
  private getItemsCount: Function;
  private getBOF: Function;
  private getEOF: Function;
  private getFirstVisible: Function;
  private getFirstVisible$: Function;
  private getLastVisible: Function;
  private getLastVisible$: Function;

  constructor() {
    this.isInitialized = false;
  }

  initialize(scroller: Scroller) {
    if (this.isInitialized) {
      return;
    }
    this.scroller = scroller;
    const { state, buffer } = scroller;
    this.isInitialized = true;
    this.callWorkflow = scroller.callWorkflow;
    this.getVersion = (): string | null => scroller.version;
    this.getIsLoading = (): boolean => state.isLoading;
    this.getIsLoading$ = (): BehaviorSubject<boolean> => state.isLoadingSource;
    this.getLoopPending = (): boolean => state.loopPending;
    this.getLoopPending$ = (): BehaviorSubject<boolean> => state.loopPendingSource;
    this.getCyclePending = (): boolean => state.workflowPending;
    this.getCyclePending$ = (): BehaviorSubject<boolean> => state.workflowPendingSource;
    this.getItemsCount = (): number => buffer.getVisibleItemsCount();
    this.getBOF = (): boolean => buffer.bof;
    this.getEOF = (): boolean => buffer.eof;
    this.initializeProtected(scroller);
  }

  initializeProtected(scroller: Scroller) {
    const { state } = scroller;
    let getFirstVisibleProtected = () => {
      getFirstVisibleProtected = () => state.firstVisibleItem;
      state.firstVisibleWanted = true;
      return state.firstVisibleItem;
    };
    let getFirstVisible$Protected = () => {
      getFirstVisible$Protected = () => state.firstVisibleSource;
      state.firstVisibleWanted = true;
      return state.firstVisibleSource;
    };
    let getLastVisibleProtected = () => {
      getLastVisibleProtected = () => state.lastVisibleItem;
      state.lastVisibleWanted = true;
      return state.lastVisibleItem;
    };
    let getLastVisible$Protected = () => {
      getLastVisible$Protected = () => state.lastVisibleSource;
      state.lastVisibleWanted = true;
      return state.lastVisibleSource;
    };
    this.getFirstVisible = (): ItemAdapter => getFirstVisibleProtected();
    this.getFirstVisible$ = (): BehaviorSubject<ItemAdapter> => getFirstVisible$Protected();
    this.getLastVisible = (): ItemAdapter => getLastVisibleProtected();
    this.getLastVisible$ = (): BehaviorSubject<ItemAdapter> => getLastVisible$Protected();
  }

  reload(reloadIndex?: number | string) {
    this.scroller.logger.log(() => `adapter: reload(${reloadIndex})`);
    this.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: ProcessStatus.start,
      payload: reloadIndex
    });
  }

  append(items: any, eof?: boolean) {
    this.scroller.logger.log(() => {
      const count = Array.isArray(items) ? items.length : 1;
      return `adapter: append([${count}], ${eof})`;
    });
    this.callWorkflow(<ProcessSubject>{
      process: Process.append,
      status: ProcessStatus.start,
      payload: { items, eof }
    });
  }

  prepend(items: any, bof?: boolean) {
    this.scroller.logger.log(() => {
      const count = Array.isArray(items) ? items.length : 1;
      return `adapter: prepend([${count}], ${bof})`;
    });
    this.callWorkflow(<ProcessSubject>{
      process: Process.prepend,
      status: ProcessStatus.start,
      payload: { items, bof }
    });
  }

  showLog() {
    this.scroller.logger.logForce();
  }

  setScrollPosition(value: number) {
    this.scroller.logger.log(() => `adapter: setScrollPosition(${value})`);
    const position = Number(value);
    const parsedValue = parseInt(<any>value, 10);
    if (position !== parsedValue) {
      this.scroller.logger.log(() =>
        `can't set scroll position because ${value} is not an integer`);
    } else {
      this.scroller.state.syntheticScroll.reset();
      this.scroller.viewport.setPosition(value);
    }
  }

  setMinIndex(value: number) {
    this.scroller.logger.log(() => `adapter: setMinIndex(${value})`);
    const index = Number(value);
    if (isNaN(index)) {
      this.scroller.logger.log(() =>
        `can't set minIndex because ${value} is not a number`);
    } else {
      this.scroller.buffer.minIndexUser = index;
    }
  }
}
