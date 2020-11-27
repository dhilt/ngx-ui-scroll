import { Settings } from './settings';
import { Logger } from './logger';
import { WorkflowCycleModel } from './state/cycle';
import { FetchModel } from './state/fetch';
import { ClipModel } from './state/clip';
import { RenderModel } from './state/render';
import { ScrollState } from './state/scroll';
import { State as IState, ScrollState as IScrollState } from '../interfaces/index';

export class State implements IState {

  readonly version: string;
  private settings: Settings;
  private logger: Logger;

  initTime: number;
  startIndex: number;

  cycle: WorkflowCycleModel;

  fetch: FetchModel;
  clip: ClipModel;
  render: RenderModel;

  scrollState: IScrollState;

  get time(): number {
    return Number(new Date()) - this.initTime;
  }

  constructor(version: string, settings: Settings, logger: Logger, loopCount?: number, cycleCount?: number) {
    this.version = version;
    this.settings = settings;
    this.logger = logger;

    this.initTime = Number(new Date());
    this.setCurrentStartIndex(settings.startIndex);

    this.cycle = new WorkflowCycleModel(this.settings.instanceIndex, cycleCount || 1, loopCount || 0);

    this.fetch = new FetchModel();
    this.clip = new ClipModel();
    this.render = new RenderModel();

    this.scrollState = new ScrollState();
  }

  setCurrentStartIndex(newStartIndex: any) {
    const { startIndex, minIndex, maxIndex } = this.settings;
    let index = Number(newStartIndex);
    if (Number.isNaN(index)) {
      this.logger.log(() => `fallback startIndex to settings.startIndex (${startIndex})`);
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
