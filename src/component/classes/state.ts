import { Direction, State as IState, Process, PreviousClip, Run } from '../interfaces/index';
import { FetchModel } from './fetch';
import { ClipModel } from './clip';

export class State implements IState {
  process: Process;
  cycleCount: number;
  countDone: number;
  pending: boolean;
  direction: Direction;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;
  previousClip: PreviousClip;
  reload: boolean;
  isInitial: boolean;

  constructor() {
    this.isInitial = false;
    this.cycleCount = 0;
    this.countDone = 0;
    this.fetch = new FetchModel();
    this.clip = new ClipModel();
    this.setPreviousClip(true);
  }

  startCycle(options: Run = {}) {
    this.pending = true;
    this.cycleCount++;

    this.process = Process.start;
    this.direction = options.direction;
    this.scroll = options.scroll || false;
    this.fetch.reset();
    this.clip.reset();
    this.reload = false;
  }

  endCycle() {
    this.pending = false;
    this.countDone++;
  }

  setPreviousClip(reset?: boolean) {
    this.previousClip = {
      isSet: !reset,
      backwardSize: this.clip.backward.size,
      forwardSize: this.clip.forward.size,
      backwardItems: this.clip.backward.items,
      forwardItems: this.clip.forward.items,
      direction: this.direction
    };
  }

  getStartIndex(): number {
    return this.fetch[this.direction].startIndex;
  }

}
