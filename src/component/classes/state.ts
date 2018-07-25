import { BehaviorSubject } from 'rxjs';

import { Direction, State as IState, Process, PreviousClip, Run, ItemAdapter } from '../interfaces/index';
import { FetchModel } from './fetch';
import { ClipModel } from './clip';

export class State implements IState {
  hasAdapter: boolean;
  process: Process;
  wfCycleCount: number;
  cycleCount: number;
  countDone: number;
  direction: Direction;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;
  previousClip: PreviousClip;
  isInitial: boolean;

  pendingSource: BehaviorSubject<boolean>;
  firstVisibleSource: BehaviorSubject<ItemAdapter>;

  get pending(): boolean {
    return this.pendingSource.getValue();
  }

  set pending(value: boolean) {
    if (this.pending !== value) {
      this.pendingSource.next(value);
    }
  }

  get firstVisibleItem(): ItemAdapter {
    return this.firstVisibleSource.getValue();
  }

  set firstVisibleItem(item: ItemAdapter) {
    if (this.firstVisibleItem.$index !== item.$index) {
      this.firstVisibleSource.next(item);
    }
  }

  constructor() {
    this.isInitial = false;
    this.wfCycleCount = 1;
    this.cycleCount = 0;
    this.countDone = 0;
    this.fetch = new FetchModel();
    this.clip = new ClipModel();
    this.setPreviousClip(true);
    this.pendingSource = new BehaviorSubject<boolean>(false);
    this.firstVisibleSource = new BehaviorSubject<ItemAdapter>({});
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

  getStartIndex(): number | null {
    return this.fetch[this.direction].startIndex;
  }

}
