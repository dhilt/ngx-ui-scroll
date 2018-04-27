import { Settings as ISettings, DevSettings as IDevSettings } from '../interfaces/index';
import { assignSettings } from '../utils/index';

export const defaultSettings: ISettings = {
  startIndex: 1,
  bufferSize: 5,
  padding: 0.5,
  infinite: false,
  horizontal: false
};

export const minSettings: ISettings = {
  bufferSize: 1,
  padding: 0.1
};

export const defaultDevSettings: IDevSettings = {
  debug: false, // logging is enabled if true; need to turn off in release
  immediateLog: true, // logging is not immediate if false, it could be forced via Workflow.logForce call
  itemIdPrefix: '', // todo : scroll instance index ?
  clipAfterFetchOnly: true,
  clipAfterScrollOnly: true,
  paddingForwardSize: 0,
  paddingBackwardSize: 0
};

export class Settings implements ISettings {

  // external settings
  startIndex;
  bufferSize;
  padding;
  infinite;
  horizontal;

  // internal dev settings
  debug;
  immediateLog;
  itemIdPrefix;
  clipAfterFetchOnly;
  clipAfterScrollOnly;
  paddingForwardSize;
  paddingBackwardSize;

  // internal current settings (could be changed during scroller's life)
  currentStartIndex;

  constructor(settings?: ISettings, devSettings?: IDevSettings) {
    assignSettings(this, settings, defaultSettings, minSettings);
    Object.assign(this, defaultDevSettings, devSettings);
    this.currentStartIndex = this.startIndex;
  }

  setCurrentStartIndex(startIndex: number | string) {
    startIndex = Number(startIndex);
    this.currentStartIndex = !isNaN(startIndex) ? startIndex : this.startIndex;
  }
}
