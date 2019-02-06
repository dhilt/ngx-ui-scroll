import { BehaviorSubject } from 'rxjs';

import {
  Direction,
  ItemAdapter,
  State as IState,
  WindowScrollState as IWindowScrollState,
  ScrollEventData as IScrollEventData,
  ScrollState as IScrollState,
  SyntheticScroll as ISyntheticScroll,
  WorkflowOptions as IWorkflowOptions
} from '../interfaces/index';
import { FetchModel } from './fetch';
import { Settings } from './settings';
import { Logger } from './logger';
import { itemAdapterEmpty } from './adapter';

class WindowScrollState implements IWindowScrollState {
  positionToUpdate: number;
  delta: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.delta = 0;
    this.positionToUpdate = 0;
  }
}

class ScrollState implements IScrollState {
  firstScroll: boolean;
  firstScrollTime: number;
  lastScrollTime: number;
  scrollTimer: number | null;
  workflowTimer: number | null;
  scroll: boolean;
  keepScroll: boolean;
  window: IWindowScrollState;

  position: number;
  time: number;
  direction: Direction;
  positionBefore: number;

  constructor() {
    this.window = new WindowScrollState();
    this.reset();
  }

  reset() {
    this.firstScroll = false;
    this.firstScrollTime = 0;
    this.lastScrollTime = 0;
    this.scrollTimer = null;
    this.workflowTimer = null;
    this.scroll = false;
    this.keepScroll = false;
    this.position = 0;
    this.time = Number(new Date());
    this.direction = Direction.forward;
    this.window.reset();
  }

  getData(): IScrollEventData {
    return new ScrollEventData(this.position, this.positionBefore, this.time, this.direction);
  }

  setData({ position, time, direction }: IScrollEventData) {
    this.position = position;
    this.time = time;
    this.direction = direction;
  }
}

class ScrollEventData implements IScrollEventData {
  time: number;
  position: number;
  direction: Direction;
  positionBefore: number | null;
  handled: boolean;

  constructor(position: number, positionBefore: number | null, time?: number, direction?: Direction) {
    this.time = time || Number(new Date());
    this.position = position;
    this.positionBefore = positionBefore;
    this.direction = direction || Direction.forward;
    this.handled = false;
  }
}

class SyntheticScroll implements ISyntheticScroll {
  before: IScrollEventData | null;
  list: Array<IScrollEventData>;

  get isSet(): boolean {
    return !!this.list.length;
  }

  get isDone(): boolean {
    return this.list.some(i => i.handled);
  }

  get position(): number | null {
    return this.getLast('position');
  }

  get time(): number | null {
    return this.getLast('time');
  }

  get direction(): Direction | null {
    return this.getLast('direction');
  }

  get handledPosition(): number | null {
    const found = this.getHandled();
    return found ? found.position : null;
  }

  get handledTime(): number | null {
    const found = this.getHandled();
    return found ? found.time : null;
  }

  get registeredTime(): number | null {
    return this.before ? this.before.time : null;
  }

  get registeredPosition(): number | null {
    return this.before ? this.before.position : null;
  }

  constructor() {
    this.reset();
  }

  private getHandled(): IScrollEventData | null {
    return this.list.find(i => i.handled) || null;
  }

  private getLast(token: string): any {
    const { length } = this.list;
    if (!length) {
      return null;
    }
    const last = this.list[length - 1];
    switch (token) {
      case 'position':
        return last.position;
      case 'time':
        return last.time;
      case 'direction':
        return last.direction;
      default:
        return null;
    }
  }

  reset() {
    this.before = null;
    this.list = [];
  }

  register({ position, time, direction }: IScrollEventData) {
    this.before = new ScrollEventData(position, null, time, direction);
  }

  push(position: number, positionBefore: number, regData: IScrollEventData) {
    const evtData = new ScrollEventData(position, positionBefore);
    if (this.registeredTime !== regData.time) {
      this.reset();
      this.register(regData);
    }
    this.list.push(evtData);
  }

  done() {
    const handled = this.getHandled();
    if (handled) { // equivalent to if (this.isDone)
      this.register(handled);
      this.list = this.list.filter(i => i.time > handled.time);
    }
    const last = this.list.length ? this.list[this.list.length - 1] : null;
    if (last) {
      last.handled = true;
    } else {
      this.reset();
    }
  }

  nearest(position: number): IScrollEventData | null {
    const last = this.before;
    if (!last) {
      return null;
    }
    const inc = last.direction === Direction.forward ? -1 : 1;
    const nearest = this.list.reduce(
      (acc: IScrollEventData | null, item: IScrollEventData) => {
        const delta = inc * (position - item.position);
        if (!acc) {
          return delta < 0 ? item : null;
        }
        const accDelta = position - acc.position;
        if (delta < 0 && delta > accDelta) {
          return item;
        }
        return acc;
      }
      , null);
    if (!nearest) {
      return last;
    }
    const synthDelta = inc * (position - nearest.position);
    const beforeDelta = inc * (position - last.position);
    if (beforeDelta < 0 && beforeDelta > synthDelta) {
      return last;
    }
    if (synthDelta < 0) {
      return nearest;
    }
    return null;
  }
}

class WorkflowOptions implements IWorkflowOptions {
  empty: boolean;
  scroll: boolean;
  keepScroll: boolean;
  byTimer: boolean;

  constructor(settings: Settings) {
    this.reset();
  }

  reset() {
    this.empty = false;
    this.scroll = false;
    this.keepScroll = false;
    this.byTimer = false;
  }
}

export class State implements IState {

  protected settings: Settings;
  protected logger: Logger;

  initTime: number;
  innerLoopCount: number;
  isInitialLoop: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;
  workflowOptions: WorkflowOptions;

  startIndex: number;
  fetch: FetchModel;
  noClip: boolean;
  doClip: boolean;
  clipCall: number;
  lastPosition: number;
  preFetchPosition: number;
  preAdjustPosition: number;
  sizeBeforeRender: number;
  sizeAfterRender: number;
  fwdPaddingBeforeRender: number;
  bwdPaddingAverageSizeItemsCount: number;

  scrollState: IScrollState;
  syntheticScroll: ISyntheticScroll;

  loopPendingSource: BehaviorSubject<boolean>;
  workflowPendingSource: BehaviorSubject<boolean>;
  isLoadingSource: BehaviorSubject<boolean>;
  firstVisibleSource: BehaviorSubject<ItemAdapter>;
  lastVisibleSource: BehaviorSubject<ItemAdapter>;
  firstVisibleWanted: boolean;
  lastVisibleWanted: boolean;

  get loopPending(): boolean {
    return this.loopPendingSource.getValue();
  }

  set loopPending(value: boolean) {
    if (this.loopPending !== value) {
      this.loopPendingSource.next(value);
    }
  }

  get workflowPending(): boolean {
    return this.workflowPendingSource.getValue();
  }

  set workflowPending(value: boolean) {
    if (this.workflowPending !== value) {
      this.workflowPendingSource.next(value);
    }
  }

  get isLoading(): boolean {
    return this.isLoadingSource.getValue();
  }

  set isLoading(value: boolean) {
    if (this.isLoading !== value) {
      this.isLoadingSource.next(value);
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
    this.innerLoopCount = 0;
    this.isInitialLoop = false;
    this.workflowCycleCount = 1;
    this.isInitialWorkflowCycle = false;
    this.countDone = 0;
    this.workflowOptions = new WorkflowOptions(settings);

    this.setCurrentStartIndex(settings.startIndex);
    this.fetch = new FetchModel();
    this.noClip = settings.infinite;
    this.doClip = false;
    this.clipCall = 0;
    this.sizeBeforeRender = 0;
    this.sizeAfterRender = 0;
    this.fwdPaddingBeforeRender = 0;
    this.bwdPaddingAverageSizeItemsCount = 0;

    this.scrollState = new ScrollState();
    this.syntheticScroll = new SyntheticScroll();

    this.loopPendingSource = new BehaviorSubject<boolean>(false);
    this.workflowPendingSource = new BehaviorSubject<boolean>(false);
    this.isLoadingSource = new BehaviorSubject<boolean>(false);
    this.firstVisibleSource = new BehaviorSubject<ItemAdapter>(itemAdapterEmpty);
    this.lastVisibleSource = new BehaviorSubject<ItemAdapter>(itemAdapterEmpty);
    this.firstVisibleWanted = false;
    this.lastVisibleWanted = false;
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

  logSynth() {
    const synth = this.syntheticScroll;
    this.logger.log(() => [
      'registered', synth.registeredPosition,
      '/ synthetic', synth.list.map(i => i.position)
    ]);
  }

}
