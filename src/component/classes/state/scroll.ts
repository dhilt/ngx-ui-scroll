import {
  Direction,
  ScrollEventData as IScrollEventData,
  ScrollState as IScrollState,
  WindowScrollState as IWindowScrollState
} from '../../interfaces/index';

import { Logger } from '../logger';

class WindowScrollState implements IWindowScrollState {
  positionToUpdate: number;
  delta: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.delta = 0;
    this.positionToUpdate = 0;
  }
}

export class ScrollState implements IScrollState {
  previous: IScrollEventData | null;
  current: IScrollEventData | null;

  scrollTimer: ReturnType<typeof setTimeout> | null;
  window: IWindowScrollState;

  syntheticPosition: number | null;
  syntheticFulfill: boolean;
  animationFrameId: number;

  constructor() {
    this.window = new WindowScrollState();
    this.reset();
  }

  reset() {
    this.previous = null;
    this.current = null;
    this.scrollTimer = null;
    this.syntheticPosition = null;
    this.syntheticFulfill = false;
    this.animationFrameId = 0;
    this.window.reset();
  }
}
