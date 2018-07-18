import { BehaviorSubject } from 'rxjs';

import { Direction, State as IState, Process, PreviousClip, Run } from '../interfaces/index';
import { FetchModel } from './fetch';
import { ClipModel } from './clip';
import { Item } from './item';

export class State implements IState {
  isInitial: boolean;
  process: Process;
  wfCycleCount: number;
  cycleCount: number;
  countDone: number;
  position: number;
  direction: Direction;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;
  previousClip: PreviousClip;
  startIndex: number;

  pendingSource: BehaviorSubject<boolean>;
  firstVisibleSource: BehaviorSubject<Item | null>;

  get pending(): boolean {
    return this.pendingSource.getValue();
  }

  set pending(value: boolean) {
    if (this.pending !== value) {
      this.pendingSource.next(value);
    }
  }

  get firstVisibleItem(): Item | null {
    return this.firstVisibleSource.getValue();
  }

  set firstVisibleItem(value: Item | null) {
    if (this.firstVisibleItem !== value) {
      this.firstVisibleSource.next(value);
    }
  }

  constructor(startIndex: number) {
    this.isInitial = false;
    this.wfCycleCount = 1;
    this.cycleCount = 0;
    this.countDone = 0;
    this.position = 0;
    this.fetch = new FetchModel();
    this.clip = new ClipModel();
    this.setPreviousClip(true);
    this.startIndex = startIndex;
    this.pendingSource = new BehaviorSubject<boolean>(false);
    this.firstVisibleSource = new BehaviorSubject<Item | null>(null);
  }

  startCycle(options: Run = {}) {
    this.pending = true;
    this.cycleCount++;

    this.process = Process.start;
    this.direction = options.direction || Direction.forward;
    this.scroll = options.scroll || false;
    this.fetch.reset();
    this.clip.reset();
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

}
