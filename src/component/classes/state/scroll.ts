import {
  Direction,
  ScrollEventData as IScrollEventData,
  ScrollState as IScrollState,
  WindowScrollState as IWindowScrollState
} from '../../interfaces/index';

import { Logger } from '../logger';
import { ScrollEventData2 } from '../../interfaces/state';

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
  previous: ScrollEventData2;
  current: ScrollEventData2;

  firstScroll: boolean;
  firstScrollTime: number;
  lastScrollTime: number;
  scrollTimer: ReturnType<typeof setTimeout> | null;
  workflowTimer: ReturnType<typeof setTimeout> | null;
  scroll: boolean;
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
    this.firstScroll = false;
    this.firstScrollTime = 0;
    this.lastScrollTime = 0;
    this.scrollTimer = null;
    this.workflowTimer = null;
    this.scroll = false;
    this.position = 0;
    this.time = Number(new Date());
    this.direction = Direction.forward;
    this.syntheticPosition = null;
    this.syntheticFulfill = false;
    this.animationFrameId = 0;
    this.window.reset();
  }

  getData(): IScrollEventData {
    return new ScrollEventData(this.position, this.positionBefore, this.time, this.direction);
  }

  setData({ position, time, direction }: IScrollEventData) {
    this.position = position;
    this.time = time;
    this.direction = direction;
  }
}

class ScrollEventData implements IScrollEventData {
  time: number;
  position: number;
  direction: Direction;
  positionBefore: number | null;
  handled: boolean;

  constructor(position: number, positionBefore: number | null, time?: number, direction?: Direction) {
    this.time = time || Number(new Date());
    this.position = position;
    this.positionBefore = positionBefore;
    this.direction = direction || Direction.forward;
    this.handled = false;
  }
}
