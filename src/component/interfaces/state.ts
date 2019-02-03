import { Direction, ItemAdapter } from './index';
import { FetchModel } from '../classes/fetch';
import { BehaviorSubject } from 'rxjs/index';

export interface WindowScrollState {
  delta: number;
  positionToUpdate: number;

  reset: Function;
}

export interface ScrollEventData {
  time: number;
  position: number;
  positionBefore: number | null;
  direction: Direction;
  handled: boolean;
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

  position: number;
  time: number;
  direction: Direction;

  reset: Function;
  getData: Function;
  setData: Function;
}

export interface SyntheticScroll {
  list: Array<ScrollEventData>;
  before: ScrollEventData | null;
  isSet: boolean;
  isDone: boolean;
  position: number | null;
  time: number | null;
  handledPosition: number | null;
  handledTime: number | null;
  registeredPosition: number | null;
  registeredTime: number | null;

  reset: Function;
  register: Function;
  push: Function;
  done: Function;
  nearest: Function;
}

export interface WorkflowOptions {
  empty: boolean;
  scroll: boolean;
  keepScroll: boolean;
  byTimer: boolean;
}

export interface State {
  initTime: number;
  innerLoopCount: number;
  isInitialLoop: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;
  workflowOptions: WorkflowOptions;

  startIndex: number;
  fetch: FetchModel;
  noClip: boolean;
  doClip: boolean;
  clipCall: number;
  lastPosition: number;
  preFetchPosition: number;
  preAdjustPosition: number;
  sizeBeforeRender: number;
  sizeAfterRender: number;
  fwdPaddingBeforeRender: number;
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
