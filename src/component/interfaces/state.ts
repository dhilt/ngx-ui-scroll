import { Direction } from './direction';

export interface PreviousClip {
  isSet: boolean;
  backwardSize: number;
  forwardSize: number;
  backwardItems: number;
  forwardItems: number;
  direction: Direction;
}

export interface State {
  cycleCount: number;
  countDone: number;
  pending: boolean;
  direction: Direction;
  scroll: boolean;
  fetch: any;
  clip: any;
  previousClip: PreviousClip;
  reload: boolean;
}
