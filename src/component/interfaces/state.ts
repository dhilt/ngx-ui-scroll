import { BehaviorSubject, Subject } from 'rxjs';

import { Direction, ItemAdapter } from './index';
import { FetchModel } from '../classes/state/fetch';
import { ClipModel } from '../classes/state/clip';
import { RenderModel } from '../classes/state/render';
import { AdjustModel } from '../classes/state/adjust';

export interface WindowScrollState {
  delta: number;
  positionToUpdate: number;

  reset: Function;
}

export interface ScrollEventData {
  time: number;
  position: number;
  direction: Direction | null;
}

export interface ScrollState {
  previous: ScrollEventData | null;
  current: ScrollEventData | null;

  scrollTimer: ReturnType<typeof setTimeout> | null;
  window: WindowScrollState;

  syntheticPosition: number | null;
  syntheticFulfill: boolean;
  animationFrameId: number;

  reset: Function;
}

export interface State {
  version: string;

  initTime: number;
  innerLoopCount: number;
  isInitialLoop: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;

  fetch: FetchModel;
  clip: ClipModel;
  render: RenderModel;
  adjust: AdjustModel;
  startIndex: number;
  lastPosition: number;

  scrollState: ScrollState;

  time: number;
  loop: string;
  loopNext: string;
}
