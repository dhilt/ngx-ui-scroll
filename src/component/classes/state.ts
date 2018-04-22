import { Direction, State as IState, PreviousClip, Run } from '../interfaces/index';
import { FetchModel } from './fetch';
import { ClipModel } from './clip';

export class State implements IState {
  cycleCount: number;
  countDone: number;
  pending: boolean;
  direction: Direction;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;
  previousClip: PreviousClip;
  reload: boolean;

  constructor() {
    this.cycleCount = 0;
    this.countDone = 0;
    this.fetch = new FetchModel();
    this.clip = new ClipModel();
    this.setPreviousClip(true);
  }

  startCycle(options: Run = {}) {
    this.pending = true;
    this.cycleCount++;

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
