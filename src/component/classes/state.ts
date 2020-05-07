import { BehaviorSubject, Subject } from 'rxjs';

import {
  ItemAdapter,
  State as IState,
  ScrollState as IScrollState
} from '../interfaces/index';

import { Settings } from './settings';
import { Logger } from './logger';
import { FetchModel } from './state/fetch';
import { ClipModel } from './state/clip';
import { RenderModel } from './state/render';
import { AdjustModel } from './state/adjust';
import { ScrollState } from './state/scroll';

export class State implements IState {

  private settings: Settings;
  readonly version: string;
  private logger: Logger;

  initTime: number;
  innerLoopCount: number;
  isInitialLoop: boolean;
  workflowCycleCount: number;
  isInitialWorkflowCycle: boolean;
  countDone: number;

  fetch: FetchModel;
  clip: ClipModel;
  render: RenderModel;
  adjust: AdjustModel;
  startIndex: number;
  lastPosition: number;
  bwdAverageSizeItemsCount: number;

  scrollState: IScrollState;

  get time(): number {
    return Number(new Date()) - this.initTime;
  }

  get loop(): string {
    return `${this.settings.instanceIndex}-${this.workflowCycleCount}-${this.innerLoopCount}`;
  }

  get loopNext(): string {
    return `${this.settings.instanceIndex}-${this.workflowCycleCount}-${this.innerLoopCount + 1}`;
  }

  constructor(settings: Settings, version: string, logger: Logger) {
    this.settings = settings;
    this.version = version;
    this.logger = logger;
    this.initTime = Number(new Date());
    this.innerLoopCount = 0;
    this.isInitialLoop = false;
    this.workflowCycleCount = 1;
    this.isInitialWorkflowCycle = false;
    this.countDone = 0;

    this.setCurrentStartIndex(settings.startIndex);
    this.fetch = new FetchModel();
    this.clip = new ClipModel();
    this.render = new RenderModel();
    this.adjust = new AdjustModel();
    this.bwdAverageSizeItemsCount = 0;

    this.scrollState = new ScrollState();
  }

  setCurrentStartIndex(newStartIndex: any) {
    const { startIndex, minIndex, maxIndex } = this.settings;
    let index = Number(newStartIndex);
    if (Number.isNaN(index)) {
      this.logger.log(() =>
        `fallback startIndex to settings.startIndex (${startIndex})`);
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
