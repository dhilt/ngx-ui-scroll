import {
  ScrollEventData as IScrollEventData,
  ScrollState as IScrollState
} from '../../interfaces/index';

export class ScrollState implements IScrollState {
  previous: IScrollEventData | null;
  current: IScrollEventData | null;

  scrollTimer: ReturnType<typeof setTimeout> | null;

  syntheticPosition: number | null;
  syntheticFulfill: boolean;
  animationFrameId: number;
  positionBeforeAsync: number | null;
  positionBeforeAdjust: number | null;
  positionAfterAdjust: number | null;

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
    this.positionBeforeAdjust = null;
    this.positionAfterAdjust = null;
  }

  hasPositionChanged(position: number): boolean {
    const before = this.positionBeforeAdjust;
    const after = this.positionAfterAdjust;
    return before === null || before !== position || after === null || after !== position;
  }
}
