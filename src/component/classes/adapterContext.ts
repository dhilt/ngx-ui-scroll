import { BehaviorSubject, Subject } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

import { Scroller } from '../scroller';
import { Logger } from './logger';
import { ItemAdapter, State as IState } from '../interfaces/index';

export class AdapterContext {
  callWorkflow: Function;
  logger: Logger;

  private init$: BehaviorSubject<boolean>;
  private isInitialized: boolean;
  private getVersion: Function;
  private getIsLoading: Function;
  private getIsLoading$: Function;
  private getCyclePending: Function;
  private getCyclePending$: Function;
  private getLoopPending: Function;
  private getLoopPending$: Function;
  private getBOF: Function;
  private getBOF$: Function;
  private getEOF: Function;
  private getEOF$: Function;
  private getFirstVisible: Function;
  private getFirstVisible$: Function;
  private getLastVisible: Function;
  private getLastVisible$: Function;
  private getItemsCount: Function;

  private getInitializedSubj(method: Function) {
    return this.init ? method() :
      this.init$.pipe(
        filter(init => !!init),
        switchMap(() => method())
      );
  }

  get init(): boolean {
    return this.isInitialized;
  }

  get version(): string | null {
    return this.isInitialized ? this.getVersion() : null;
  }

  get isLoading(): boolean {
    return this.isInitialized ? this.getIsLoading() : false;
  }

  get isLoading$(): Subject<boolean> {
    return this.getInitializedSubj(() => this.getIsLoading$());
  }

  get loopPending(): boolean {
    return this.isInitialized ? this.getLoopPending() : false;
  }

  get loopPending$(): Subject<boolean> {
    return this.getInitializedSubj(() => this.getLoopPending$());
  }

  get cyclePending(): boolean {
    return this.isInitialized ? this.getCyclePending() : false;
  }

  get cyclePending$(): Subject<boolean> {
    return this.getInitializedSubj(() => this.getCyclePending$());
  }

  get bof(): boolean {
    return this.isInitialized ? this.getBOF() : false;
  }

  get bof$(): Subject<boolean> {
    return this.getInitializedSubj(() => this.getBOF$());
  }

  get eof(): boolean {
    return this.isInitialized ? this.getEOF() : false;
  }

  get eof$(): Subject<boolean> {
    return this.getInitializedSubj(() => this.getEOF$());
  }

  get firstVisible(): ItemAdapter {
    return this.isInitialized ? this.getFirstVisible() : {};
  }

  get firstVisible$(): BehaviorSubject<ItemAdapter> {
    return this.getInitializedSubj(() => this.getFirstVisible$());
  }

  get lastVisible(): ItemAdapter {
    return this.isInitialized ? this.getLastVisible() : {};
  }

  get lastVisible$(): BehaviorSubject<ItemAdapter> {
    return this.getInitializedSubj(() => this.getLastVisible$());
  }

  get itemsCount(): number {
    return this.isInitialized ? this.getItemsCount() : 0;
  }

  constructor(init$: BehaviorSubject<boolean>) {
    this.isInitialized = false;
    this.init$ = init$;
  }

  initialize(scroller: Scroller) {
    if (this.isInitialized) {
      return;
    }
    const { state, buffer, logger, workflow } = scroller;
    this.callWorkflow = workflow.call;
    this.logger = logger;

    this.getVersion = (): string | null => scroller.version;
    this.getIsLoading = (): boolean => state.isLoading;
    this.getIsLoading$ = (): Subject<boolean> => state.isLoadingSource;
    this.getLoopPending = (): boolean => state.loopPending;
    this.getLoopPending$ = (): Subject<boolean> => state.loopPendingSource;
    this.getCyclePending = (): boolean => state.workflowPending;
    this.getCyclePending$ = (): Subject<boolean> => state.workflowPendingSource;
    this.getItemsCount = (): number => buffer.getVisibleItemsCount();
    this.getBOF = (): boolean => buffer.bof;
    this.getBOF$ = (): Subject<boolean> => buffer.bofSource;
    this.getEOF = (): boolean => buffer.eof;
    this.getEOF$ = (): Subject<boolean> => buffer.eofSource;

    this.initializeProtected(state);

    // run the subscriptions
    this.isInitialized = true;
    this.init$.next(true);
    this.init$.complete();
  }

  dispose() {
    if (!this.init$.closed) {
      this.init$.complete();
    }
  }

  private initializeProtected(state: IState) {
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
}
