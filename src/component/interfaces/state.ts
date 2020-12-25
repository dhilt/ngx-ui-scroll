import { Direction } from './index';
import { WorkflowCycleModel } from '../classes/state/cycle';
import { FetchModel } from '../classes/state/fetch';
import { ClipModel } from '../classes/state/clip';
import { RenderModel } from '../classes/state/render';

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
  positionBeforeAdjust: number | null;
  positionAfterAdjust: number | null;

  reset: Function;
  cleanupTimers: Function;
  hasPositionChanged: (position: number) => boolean;
}

export interface State {
  version: string;
  initTime: number;
  cycle: WorkflowCycleModel;
  fetch: FetchModel;
  clip: ClipModel;
  render: RenderModel;
  scrollState: ScrollState;
  time: number;
}
