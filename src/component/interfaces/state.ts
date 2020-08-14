import { BehaviorSubject, Subject } from 'rxjs';

import { Direction, ItemAdapter } from './index';
import { FetchModel } from '../classes/state/fetch';
import { ClipModel } from '../classes/state/clip';
import { RenderModel } from '../classes/state/render';
import { AdjustModel } from '../classes/state/adjust';

export interface ScrollEventData {
  time: number;
  position: number;
  direction: Direction | null;
}

export interface ScrollState {
  previous: ScrollEventData | null;
  current: ScrollEventData | null;

  scrollTimer: ReturnType<typeof setTimeout> | null;

  syntheticPosition: number | null;
  syntheticFulfill: boolean;
  animationFrameId: number;
  positionBeforeAsync: number | null;

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
  startIndex: number;

  fetch: FetchModel;
  clip: ClipModel;
  render: RenderModel;
  adjust: AdjustModel;

  scrollState: ScrollState;

  time: number;
  loop: string;
  loopNext: string;
}
