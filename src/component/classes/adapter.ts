import { BehaviorSubject, Observable, Observer, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Adapter as IAdapter, Process, ProcessSubject, ProcessStatus, ItemAdapter } from '../interfaces/index';
import { Scroller } from '../scroller';
import { Item } from './item';

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

export const generateMockAdapter = (): IAdapter => (
  <IAdapter> {
    version: null,
    init: false,
    init$: observableOf(false),
    isLoading: false,
    isLoading$: new BehaviorSubject<boolean>(false),
    firstVisible: {},
    firstVisible$: new BehaviorSubject<ItemAdapter>({}),
    lastVisible: {},
    lastVisible$: new BehaviorSubject<ItemAdapter>({}),
    itemsCount: 0,
    initialize: () => null,
    reload: () => null,
    showLog: () => null,
    setMinIndex: () => null
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

  private scroller: Scroller;
  private isInitialized: boolean;
  private callWorkflow: Function;
  private getVersion: Function;
  private getIsLoading: Function;
  private getIsLoading$: Function;
  private getFirstVisible: Function;
  private getFirstVisible$: Function;
  private getLastVisible: Function;
  private getLastVisible$: Function;
  private getItemsCount: Function;

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
    this.getIsLoading = (): boolean => state.pending;
    this.getIsLoading$ = (): BehaviorSubject<boolean> => state.pendingSource;
    this.getFirstVisible = (): ItemAdapter => state.firstVisibleItem;
    this.getFirstVisible$ = (): BehaviorSubject<ItemAdapter> => state.firstVisibleSource;
    this.getLastVisible = (): ItemAdapter => state.lastVisibleItem;
    this.getLastVisible$ = (): BehaviorSubject<ItemAdapter> => state.lastVisibleSource;
    this.getItemsCount = (): number => buffer.getVisibleItemsCount();
  }

  reload(reloadIndex?: number | string) {
    this.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: ProcessStatus.start,
      payload: reloadIndex
    });
  }

  showLog() {
    this.scroller.logger.logForce();
  }

  setMinIndex(value: number) {
    const index = Number(value);
    if (isNaN(index)) {
      this.scroller.logger.log(() =>
        `can't set minIndex because ${value} is not a number`);
    } else {
      this.scroller.buffer.minIndexUser = index;
    }
  }
}
