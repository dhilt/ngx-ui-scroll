import { Settings as ISettings, DevSettings as IDevSettings } from '../interfaces/index';
import { assignSettings } from '../utils/index';

export const defaultSettings: ISettings = {
  startIndex: 1,
  bufferSize: 5,
  padding: 0.5,
  infinite: false,
  horizontal: false,
  windowViewport: false
};

export const minSettings: ISettings = {
  bufferSize: 1,
  padding: 0.01
};

export const defaultDevSettings: IDevSettings = {
  debug: false, // logging is enabled if true; need to turn off in release
  immediateLog: true, // logging is not immediate if false, it could be forced via Workflow.logForce call
  clipAfterFetchOnly: true,
  clipAfterScrollOnly: true,
  paddingForwardSize: 0,
  paddingBackwardSize: 0,
  throttle: 40
};

export class Settings implements ISettings {

  // user settings
  startIndex;
  bufferSize;
  padding;
  infinite;
  horizontal;
  windowViewport;

  // development settings
  debug;
  immediateLog;
  clipAfterFetchOnly;
  clipAfterScrollOnly;
  paddingForwardSize;
  paddingBackwardSize;
  throttle;

  // internal settings, managed by scroller itself
  currentStartIndex;
  instanceIndex;

  constructor(settings: ISettings, devSettings: IDevSettings, instanceIndex: number) {
    assignSettings(this, settings, defaultSettings, minSettings);
    Object.assign(this, defaultDevSettings, devSettings);
    this.currentStartIndex = this.startIndex;
    this.instanceIndex = instanceIndex;
  }

  setCurrentStartIndex(startIndex: any) {
    startIndex = Number(startIndex);
    this.currentStartIndex = !isNaN(startIndex) ? startIndex : this.startIndex;
  }
}
