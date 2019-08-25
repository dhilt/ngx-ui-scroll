import { BehaviorSubject } from 'rxjs';

import { Scroller } from '../scroller';
import { Logger } from './logger';

import { AdapterContext as IAdapterContext, ItemAdapter, State as IState } from '../interfaces/index';

export class AdapterContext implements IAdapterContext {

  init: Function;
  logger: Logger;
  callWorkflow: Function;

  getVersion: Function;
  getIsLoading: Function;
  getIsLoading$: Function;
  getCyclePending: Function;
  getCyclePending$: Function;
  getLoopPending: Function;
  getLoopPending$: Function;
  getItemsCount: Function;
  getBOF: Function;
  getEOF: Function;
  getFirstVisible: Function;
  getFirstVisible$: Function;
  getLastVisible: Function;
  getLastVisible$: Function;
  _setScrollPosition: Function;

  constructor(init: Function) {
    this.init = init;
  }

  initialize(scroller: Scroller) {
    const { adapter } = scroller.datasource;
    if (adapter.init) {
      return;
    }
    this.logger = scroller.logger;
    const { state, buffer } = scroller;
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
    this.initializeProtected(state);

    // undocumented
    this._setScrollPosition = (value: number) => {
      state.syntheticScroll.reset();
      scroller.viewport.setPosition(value);
    };

    // run the subscriptions
    this.init();
  }

  initializeProtected(state: IState) {
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
