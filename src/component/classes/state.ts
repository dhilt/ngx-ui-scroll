import { BehaviorSubject } from 'rxjs';

import { Direction, State as IState, Process, Run, ItemAdapter } from '../interfaces/index';
import { FetchModel } from './fetch';
import { ClipModel } from './clip';

export class State implements IState {
  initTime: number;
  isInitial: boolean;
  process: Process;
  wfCycleCount: number;
  cycleCount: number;
  countDone: number;
  position: number;
  direction: Direction;
  startIndex: number;
  scroll: boolean;
  fetch: FetchModel;
  clip: ClipModel;

  pendingSource: BehaviorSubject<boolean>;
  firstVisibleSource: BehaviorSubject<ItemAdapter>;
  lastVisibleSource: BehaviorSubject<ItemAdapter>;

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

  get lastVisibleItem(): ItemAdapter {
    return this.lastVisibleSource.getValue();
  }

  set lastVisibleItem(item: ItemAdapter) {
    if (this.lastVisibleItem.$index !== item.$index) {
      this.lastVisibleSource.next(item);
    }
  }

  get time(): number {
    return Number(new Date()) - this.initTime;
  }

  constructor(startIndex: number) {
    this.initTime = Number(new Date());
    this.isInitial = false;
    this.wfCycleCount = 1;
    this.cycleCount = 0;
    this.countDone = 0;
    this.position = 0;
    this.fetch = new FetchModel();
    this.clip = new ClipModel();
    this.startIndex = startIndex;
    this.pendingSource = new BehaviorSubject<boolean>(false);
    this.firstVisibleSource = new BehaviorSubject<ItemAdapter>({});
    this.lastVisibleSource = new BehaviorSubject<ItemAdapter>({});
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

}
