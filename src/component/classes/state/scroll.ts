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

  firstScroll: boolean;
  firstScrollTime: number;
  lastScrollTime: number;
  scrollTimer: ReturnType<typeof setTimeout> | null;
  window: IWindowScrollState;

  position: number;
  time: number;
  direction: Direction;
  positionBefore: number;

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
    this.firstScroll = false;
    this.firstScrollTime = 0;
    this.lastScrollTime = 0;
    this.scrollTimer = null;
    this.position = 0;
    this.time = Number(new Date());
    this.direction = Direction.forward;
    this.syntheticPosition = null;
    this.syntheticFulfill = false;
    this.animationFrameId = 0;
    this.window.reset();
  }
}
