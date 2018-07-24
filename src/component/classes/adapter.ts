import { BehaviorSubject, Observable, Observer, of as observableOf } from 'rxjs';

import { Adapter as IAdapter, Process, ProcessSubject, ItemAdapter, Datasource } from '../interfaces/index';
import { Scroller } from '../scroller';

export class Adapter implements IAdapter {

  get isInitialized(): boolean {
    return true;
  }

  get isInitialized$(): Observable<boolean> {
    return observableOf(true);
  }

  get version(): string | null {
    return this.getVersion();
  }

  get isLoading(): boolean {
    return this.getIsLoading();
  }

  get isLoading$(): BehaviorSubject<boolean> {
    return this.getIsLoading$();
  }

  get firstVisible(): ItemAdapter {
    return this.getFirstVisible();
  }

  get firstVisible$(): BehaviorSubject<ItemAdapter> {
    return this.getFirstVisible$();
  }

  private readonly getVersion: Function;
  private readonly getIsLoading: Function;
  private readonly getIsLoading$: Function;
  private readonly getFirstVisible: Function;
  private readonly getFirstVisible$: Function;
  private readonly callWorkflow: Function;

  constructor(scroller: Scroller) {
    this.callWorkflow = scroller.callWorkflow;
    this.getVersion = (): string | null => scroller.version;
    this.getIsLoading = (): boolean => scroller.state.pendingSource.getValue();
    this.getIsLoading$ = (): BehaviorSubject<boolean> => scroller.state.pendingSource;
    this.getFirstVisible = (): ItemAdapter => scroller.state.firstVisibleSource.getValue();
    this.getFirstVisible$ = (): BehaviorSubject<ItemAdapter> => scroller.state.firstVisibleSource;
  }

  reload(reloadIndex?: number | string) {
    this.callWorkflow(<ProcessSubject>{
      process: Process.reload,
      status: 'start',
      payload: reloadIndex
    });
  }
}

const getIsInitialized = (datasource: Datasource) =>
  Observable.create((observer: Observer<boolean>) => {
    const intervalId = setInterval(() => {
      if (datasource.adapter && datasource.adapter.isInitialized) {
        clearInterval(intervalId);
        observer.next(true);
        observer.complete();
      }
    }, 25);
  });

export const generateMockAdapter = (datasource: Datasource): IAdapter => (
  <IAdapter> {
    version: null,
    isInitialized: false,
    isInitialized$: getIsInitialized(datasource),
    isLoading: false,
    isLoading$: new BehaviorSubject<boolean>(false),
    firstVisible: {},
    firstVisible$: new BehaviorSubject<ItemAdapter>({}),
    reload: () => null
  }
);
