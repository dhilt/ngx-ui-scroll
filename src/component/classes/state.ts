import { BehaviorSubject } from 'rxjs';

import {
  State as IState,
  Process,
  ProcessRun,
  ItemAdapter,
  Direction,
  ScrollState as IScrollState,
  SyntheticScroll as ISyntheticScroll
} from '../interfaces/index';
import { FetchModel } from './fetch';
import { Settings } from './settings';
import { Logger } from './logger';

class ScrollState implements IScrollState {
  firstScroll: boolean;
  lastScrollTime: number;
  scrollTimer: number | null;
  scroll: boolean;
  direction: Direction | null;
  keepScroll: boolean;

  constructor() {
    this.reset();
  }

  reset() {
    this.firstScroll = false;
    this.lastScrollTime = 0;
    this.scrollTimer = null;
    this.scroll = false;
    this.direction = null;
    this.keepScroll = false;
  }
}

class SyntheticScroll implements ISyntheticScroll {
  position: number | null;
  positionBefore: number | null;
  delta: number;
  time: number;
  readyToReset: boolean;

  constructor() {
    this.reset(null);
  }

  reset(position: number | null) {
    this.position = position;
    this.positionBefore = null;
    this.delta = 0;
    this.time = 0;
    this.readyToReset = false;
  }
}

export class State implements IState {

  protected settings: Settings;
  protected logger: Logger;

  initTime: number;
  cycleCount: number;
  isInitialCycle: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;

  process: Process;
  startIndex: number;
  fetch: FetchModel;
  clip: boolean;
  clipCall: number;
  lastPosition: number;
  preFetchPosition: number;
  preAdjustPosition: number;
  sizeBeforeRender: number;
  bwdPaddingAverageSizeItemsCount: number;

  scrollState: IScrollState;
  syntheticScroll: ISyntheticScroll;

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

  constructor(settings: Settings, logger: Logger) {
    this.settings = settings;
    this.logger = logger;
    this.initTime = Number(new Date());
    this.cycleCount = 0;
    this.isInitialCycle = false;
    this.workflowCycleCount = 1;
    this.isInitialWorkflowCycle = false;
    this.countDone = 0;

    this.setCurrentStartIndex(settings.startIndex);
    this.fetch = new FetchModel();
    this.clip = false;
    this.clipCall = 0;
    this.sizeBeforeRender = 0;
    this.bwdPaddingAverageSizeItemsCount = 0;

    this.scrollState = new ScrollState();
    this.syntheticScroll = new SyntheticScroll();

    this.pendingSource = new BehaviorSubject<boolean>(false);
    this.firstVisibleSource = new BehaviorSubject<ItemAdapter>({});
    this.lastVisibleSource = new BehaviorSubject<ItemAdapter>({});
  }

  startCycle(options?: ProcessRun) {
    this.pending = true;
    this.cycleCount++;
    this.process = Process.start;
    this.fetch.reset();
    this.clip = false;
    if (options) {
      this.scrollState.scroll = options.scroll;
      this.scrollState.direction = options.direction;
      this.scrollState.keepScroll = options.keepScroll;
    }
    this.scrollState.keepScroll = false;
  }

  endCycle() {
    this.pending = false;
    this.countDone++;
    this.isInitialCycle = false;
  }

  setCurrentStartIndex(newStartIndex: any) {
    const { startIndex, minIndex, maxIndex } = this.settings;
    let index = Number(newStartIndex);
    if (isNaN(index)) {
      this.logger.log(() =>
        `fallback startIndex to settings.startIndex (${startIndex}) because ${newStartIndex} is not a number`);
      index = startIndex;
    }
    if (index < minIndex) {
      this.logger.log(() => `setting startIndex to settings.minIndex (${minIndex}) because ${index} < ${minIndex}`);
      index = minIndex;
    }
    if (index > maxIndex) {
      this.logger.log(() => `setting startIndex to settings.maxIndex (${maxIndex}) because ${index} > ${maxIndex}`);
      index = maxIndex;
    }
    this.startIndex = index;
  }

}
