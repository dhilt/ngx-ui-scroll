import { State as IState } from '../interfaces/state';
import { Direction } from '../interfaces/direction';
import { FetchModel } from './fetch';
import { ClipModel } from './clip';

interface PreviousClip {
  isSet: boolean;
  backwardSize: number;
  forwardSize: number;
  backwardItems: number;
  forwardItems: number;
  direction: Direction;
}

export class State implements IState {
  countStart: number;
  countDone: number;
  pending: boolean;
  direction: Direction;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;
  previousClip: PreviousClip;

  constructor() {
    this.countStart = 0;
    this.countDone = 0;
    this.pending = false;
    this.direction = null;
    this.scroll = false;

    this.fetch = new FetchModel();
    this.clip = new ClipModel();
    this.setPreviousClip(true);
  }

  setPreviousClip(reset?: boolean) {
    this.previousClip = {
      isSet: !reset,
      backwardSize: this.clip.backward.size,
      forwardSize: this.clip.forward.size,
      backwardItems: this.clip.backward.items,
      forwardItems: this.clip.forward.items,
      direction: this.direction
    }
  }

}
