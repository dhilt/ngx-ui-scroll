import { BehaviorSubject } from 'rxjs';

import { State as IState, Process, ProcessRun, ItemAdapter, Direction } from '../interfaces/index';
import { FetchModel } from './fetch';

export class State implements IState {
  initTime: number;
  cycleCount: number;
  isInitialCycle: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;

  process: Process;
  startIndex: number;
  scroll: boolean;
  direction: Direction | null;
  fetch: FetchModel;
  clip: boolean;
  lastPosition: number;

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
    this.cycleCount = 0;
    this.isInitialCycle = false;
    this.workflowCycleCount = 1;
    this.isInitialWorkflowCycle = false;
    this.countDone = 0;

    this.startIndex = startIndex;
    this.scroll = false;
    this.direction = null;
    this.fetch = new FetchModel();
    this.clip = false;

    this.pendingSource = new BehaviorSubject<boolean>(false);
    this.firstVisibleSource = new BehaviorSubject<ItemAdapter>({});
    this.lastVisibleSource = new BehaviorSubject<ItemAdapter>({});
  }

  startCycle(options?: ProcessRun) {
    this.pending = true;
    this.cycleCount++;
    this.process = Process.start;
    if (options) {
      this.scroll = options.scroll;
      this.direction = options.direction;
    } else {
      this.scroll = false;
      this.direction = null;
    }
    this.fetch.reset();
    this.clip = false;
  }

  endCycle() {
    this.pending = false;
    this.countDone++;
    this.isInitialCycle = false;
  }

}
