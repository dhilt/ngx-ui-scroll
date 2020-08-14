import {
  Direction,
  ScrollEventData as IScrollEventData,
  ScrollState as IScrollState
} from '../../interfaces/index';

import { Logger } from '../logger';

export class ScrollState implements IScrollState {
  previous: IScrollEventData | null;
  current: IScrollEventData | null;

  scrollTimer: ReturnType<typeof setTimeout> | null;

  syntheticPosition: number | null;
  syntheticFulfill: boolean;
  animationFrameId: number;
  positionBeforeAsync: number | null;

  constructor() {
    this.reset();
  }

  reset() {
    this.previous = null;
    this.current = null;
    this.scrollTimer = null;
    this.syntheticPosition = null;
    this.syntheticFulfill = false;
    this.animationFrameId = 0;
    this.positionBeforeAsync = null;
  }
}
