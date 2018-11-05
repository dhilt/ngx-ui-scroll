import { ItemAdapter } from './index';
import { FetchModel } from '../classes/fetch';
import { BehaviorSubject } from 'rxjs/index';

export interface WindowScrollState {
  delta: number;
  positionToUpdate: number;

  reset: Function;
}

export interface ScrollState {
  firstScroll: boolean;
  firstScrollTime: number;
  lastScrollTime: number;
  scrollTimer: number | null;
  workflowTimer: number | null;
  scroll: boolean;
  keepScroll: boolean;
  window: WindowScrollState;

  reset: Function;
}

export interface SyntheticScroll {
  position: number | null;
  positionBefore: number | null;
  delta: number;
  time: number;
  readyToReset: boolean;

  reset: Function;
}

export interface State {
  initTime: number;
  innerLoopCount: number;
  isInitialLoop: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;

  startIndex: number;
  fetch: FetchModel;
  clip: boolean;
  clipCall: number;
  lastPosition: number;
  preFetchPosition: number;
  preAdjustPosition: number;
  sizeBeforeRender: number;
  bwdPaddingAverageSizeItemsCount: number;

  scrollState: ScrollState;
  syntheticScroll: SyntheticScroll;

  loopPendingSource: BehaviorSubject<boolean>;
  workflowPendingSource: BehaviorSubject<boolean>;
  firstVisibleSource: BehaviorSubject<ItemAdapter>;
  lastVisibleSource: BehaviorSubject<ItemAdapter>;

  loopPending: boolean;
  workflowPending: boolean;
  firstVisibleItem: ItemAdapter;
  lastVisibleItem: ItemAdapter;
  firstVisibleWanted: boolean;
  lastVisibleWanted: boolean;

  time: number;
}
