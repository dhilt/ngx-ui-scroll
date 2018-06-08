import { Direction } from './direction';
import { Process } from './process';

export interface PreviousClip {
  isSet: boolean;
  backwardSize: number;
  forwardSize: number;
  backwardItems: number;
  forwardItems: number;
  direction: Direction;
}

export interface State {
  process: Process;
  wfCycleCount: number;
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
