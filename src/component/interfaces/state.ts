import { Process, ItemAdapter, Direction } from './index';
import { FetchModel } from '../classes/fetch';

export interface ScrollState {
  lastScrollTime: number;
  scrollTimer: number | null;
  scroll: boolean;
  direction: Direction | null;
  keepScroll: boolean;
}

export interface SyntheticScroll {
  position: number | null;
  positionBefore: number | null;
  delta: number;
  time: number;
  readyToReset: boolean;
}

export interface State {
  initTime: number;
  cycleCount: number;
  isInitialCycle: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;

  process: Process;
  startIndex: number;
  fetch: FetchModel;
  clip: boolean;
  lastPosition: number;
  preFetchPosition: number;
  preAdjustPosition: number;
  sizeBeforeRender: number;
  bwdPaddingAverageSizeItemsCount: number;

  pending: boolean;
  firstVisibleItem: ItemAdapter;
  lastVisibleItem: ItemAdapter;
}
