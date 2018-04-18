import { State as IState } from '../interfaces/state';
import { Direction } from '../interfaces/direction';
import { FetchModel } from './fetch';
import { ClipModel } from './clip';

export class State implements IState {
  countStart: number;
  countDone : number;
  pending: boolean;
  direction: Direction;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;

  constructor() {
    this.countStart = 0;
    this.countDone = 0;
    this.pending = false;
    this.direction = null;
    this.scroll = false;

    this.fetch = new FetchModel();
    this.clip = new ClipModel();
  }

}
