import { Settings } from './settings';
import { WorkflowCycleModel } from './state/cycle';
import { FetchModel } from './state/fetch';
import { ClipModel } from './state/clip';
import { RenderModel } from './state/render';
import { ScrollState } from './state/scroll';
import { State as IState, ScrollState as IScrollState } from '../interfaces/index';

export class State implements IState {

  readonly version: string;
  private settings: Settings;

  initTime: number;

  cycle: WorkflowCycleModel;

  fetch: FetchModel;
  clip: ClipModel;
  render: RenderModel;

  scrollState: IScrollState;

  get time(): number {
    return Number(new Date()) - this.initTime;
  }

  constructor(version: string, settings: Settings, state?: IState) {
    this.version = version;
    this.settings = settings;

    this.initTime = Number(new Date());

    this.cycle = new WorkflowCycleModel(this.settings.instanceIndex, state ? state.cycle : void 0);

    this.fetch = new FetchModel();
    this.clip = new ClipModel();
    this.render = new RenderModel();

    this.scrollState = new ScrollState();
  }

  endInnerLoop() {
    const { fetch, render, cycle } = this;
    if (fetch.cancel) {
      fetch.cancel();
      fetch.cancel = null;
    }
    if (render.renderTimer) {
      clearTimeout(render.renderTimer);
      render.renderTimer = null;
    }
    cycle.innerLoop.done();
  }

  startInnerLoop() {
    const { cycle, scrollState: scroll, fetch, render, clip } = this;
    cycle.innerLoop.start();
    scroll.positionBeforeAsync = null;
    if (!fetch.simulate) {
      fetch.reset();
    }
    if (!clip.simulate) {
      clip.reset(clip.force);
    }
    render.reset();
  }

  dispose() {
    this.cycle.dispose();
    this.endInnerLoop();
    this.scrollState.cleanupTimers();
  }

}
