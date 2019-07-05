import { BehaviorSubject } from 'rxjs';

import {
  ItemAdapter,
  State as IState,
  ScrollState as IScrollState,
  SyntheticScroll as ISyntheticScroll,
  WorkflowOptions as IWorkflowOptions
} from '../interfaces/index';

import { Settings } from './settings';
import { Logger } from './logger';
import { itemAdapterEmpty } from './adapter';
import { FetchModel } from './state/fetch';
import { ClipModel } from './state/clip';
import { WorkflowOptions } from './state/workflowOptions';
import { ScrollState, SyntheticScroll } from './state/scroll';

export class State implements IState {

  protected settings: Settings;
  protected logger: Logger;

  initTime: number;
  innerLoopCount: number;
  isInitialLoop: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;
  workflowOptions: IWorkflowOptions;

  fetch: FetchModel;
  clip: ClipModel;
  startIndex: number;
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

  get loop(): string {
    return `${this.settings.instanceIndex}-${this.workflowCycleCount}-${this.innerLoopCount}`;
  }

  get loopNext(): string {
    return `${this.settings.instanceIndex}-${this.workflowCycleCount}-${this.innerLoopCount + 1}`;
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
    this.clip = new ClipModel();
    this.sizeBeforeRender = 0;
    this.sizeAfterRender = 0;
    this.fwdPaddingBeforeRender = 0;
    this.bwdPaddingAverageSizeItemsCount = 0;

    this.scrollState = new ScrollState();
    this.syntheticScroll = new SyntheticScroll(logger);

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

}
