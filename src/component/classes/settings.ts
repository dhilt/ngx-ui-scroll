import { Settings as ISettings, DevSettings as IDevSettings } from '../interfaces/index';
import { assignSettings, assignDevSettings } from '../utils/index';

export const defaultSettings: ISettings = {
  adapter: false,
  startIndex: 1,
  minIndex: -Infinity,
  maxIndex: Infinity,
  bufferSize: 5,
  padding: 0.5,
  infinite: false,
  horizontal: false,
  windowViewport: false,
  inverse: false // [experimental] if true, backward padding element will have a priority when filling the viewport in case of lack of items
};

export const minSettings: ISettings = {
  itemSize: 1,
  bufferSize: 1,
  padding: 0.01
};

export const defaultDevSettings: IDevSettings = {
  debug: false, // if true, logging is enabled; need to turn off when release
  immediateLog: true, // if false, logging is not immediate and could be done via Workflow.logForce call
  logTime: false, // if true, time differences will be logged
  logProcessRun: false, // if true, process fire/run info will be logged
  throttle: 40, // if > 0, scroll event handling is throttled (ms)
  initDelay: 1, // if set, the Workflow initialization will be postponed (ms)
  initWindowDelay: 40, // if set and the entire window is scrollable, the Workflow init will be postponed (ms)
  changeOverflow: false, // if true, scroll will be disabled per each item's average size change
};

export const minDevSettings: IDevSettings = {
  throttle: 0,
  initDelay: 0,
  initWindowDelay: 0
};

export class Settings implements ISettings, IDevSettings {

  // user settings
  adapter: boolean;
  startIndex: number;
  minIndex: number;
  maxIndex: number;
  itemSize: number;
  bufferSize: number;
  padding: number;
  infinite: boolean;
  horizontal: boolean;
  windowViewport: boolean;

  // development settings
  debug: boolean;
  immediateLog: boolean;
  logTime: boolean;
  logProcessRun: boolean;
  throttle: number;
  initDelay: number;
  initWindowDelay: number;
  changeOverflow: boolean;
  inverse: boolean;

  // internal settings, managed by scroller itself
  instanceIndex: number;
  initializeDelay: number;

  constructor(
    settings: ISettings | undefined, devSettings: IDevSettings | undefined, instanceIndex: number
  ) {
    assignSettings(this, settings || {}, defaultSettings, minSettings);
    assignDevSettings(this, devSettings || {}, defaultDevSettings, minDevSettings);
    this.instanceIndex = instanceIndex;
    this.initializeDelay = this.getInitializeDelay();
    // todo: min/max indexes must be ignored if infinite mode is enabled ??
  }

  getInitializeDelay(): number {
    let result = 0;
    if (this.windowViewport && this.initWindowDelay && !('scrollRestoration' in history)) {
      result = this.initWindowDelay;
    }
    if (this.initDelay > 0) {
      result = Math.max(result, this.initDelay);
    }
    return result;
  }
}
