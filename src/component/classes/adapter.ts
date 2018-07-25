import { BehaviorSubject, Observable, Observer, of as observableOf } from 'rxjs';

import { Adapter as IAdapter, Process, ProcessSubject, ItemAdapter, Datasource } from '../interfaces/index';
import { Scroller } from '../scroller';

export class Adapter implements IAdapter {

  get init(): boolean {
    return this.isInitialized;
  }

  get init$(): Observable<boolean> {
    return observableOf(this.isInitialized);
  }

  get version(): string | null {
    return this.isInitialized ? this.getVersion() : null;
  }

  get isLoading(): boolean {
    return this.isInitialized ? this.getIsLoading() : false;
  }

  get isLoading$(): BehaviorSubject<boolean> {
    return this.isInitialized ? this.getIsLoading$() : observableOf(false);
  }

  get firstVisible(): ItemAdapter {
    return this.isInitialized ? this.getFirstVisible() : {};
  }

  get firstVisible$(): BehaviorSubject<ItemAdapter> {
    return this.isInitialized ? this.getFirstVisible$() : observableOf({});
  }

  private isInitialized: boolean;
  private callWorkflow: Function;
  private getVersion: Function;
  private getIsLoading: Function;
  private getIsLoading$: Function;
  private getFirstVisible: Function;
  private getFirstVisible$: Function;

  constructor() {
    this.isInitialized = false;
  }

  initialize(scroller: Scroller) {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.callWorkflow = scroller.callWorkflow;
      this.getVersion = (): string | null => scroller.version;
      this.getIsLoading = (): boolean => scroller.state.pendingSource.getValue();
      this.getIsLoading$ = (): BehaviorSubject<boolean> => scroller.state.pendingSource;
      this.getFirstVisible = (): ItemAdapter => scroller.state.firstVisibleSource.getValue();
      this.getFirstVisible$ = (): BehaviorSubject<ItemAdapter> => scroller.state.firstVisibleSource;
    }
  }

  reload(reloadIndex?: number | string) {
    this.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: 'start',
      payload: reloadIndex
    });
  }
}

// const getIsInitialized = (datasource: Datasource) =>
//   Observable.create((observer: Observer<boolean>) => {
//     const intervalId = setInterval(() => {
//       if (datasource.adapter && datasource.adapter.init) {
//         clearInterval(intervalId);
//         observer.next(true);
//         observer.complete();
//       }
//     }, 25);
//   });

export const generateMockAdapter = (): IAdapter => (
  <IAdapter> {
    version: null,
    init: false,
    init$: observableOf(false),
    isLoading: false,
    isLoading$: new BehaviorSubject<boolean>(false),
    firstVisible: {},
    firstVisible$: new BehaviorSubject<ItemAdapter>({}),
    reload: () => null
  }
);
