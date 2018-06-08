import { Direction } from './direction';
import { Process } from './process';

export interface PreviousClip {
  isSet: boolean;
  backwardSize: number | null;
  forwardSize: number | null;
  backwardItems: number | null;
  forwardItems: number | null;
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
