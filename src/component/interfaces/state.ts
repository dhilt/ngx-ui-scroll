import { ItemAdapter } from './index';
import { FetchModel } from '../classes/fetch';

export interface ScrollState {
  firstScroll: boolean;
  lastScrollTime: number;
  scrollTimer: number | null;
  workflowTimer: number | null;
  scroll: boolean;
  keepScroll: boolean;

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
  cycleCount: number;
  isInitialCycle: boolean;
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

  pending: boolean;
  workflowPending: boolean;
  firstVisibleItem: ItemAdapter;
  lastVisibleItem: ItemAdapter;
}
