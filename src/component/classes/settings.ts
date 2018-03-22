import { Settings as SettingsInterface } from '../interfaces/settings';
import { assignSettings } from '../utils/index';

export const defaultSettings: SettingsInterface = {
  startIndex: 1,
  bufferSize: 5,
  padding: 0.5,
  infinite: false,
  horizontal: false
};

export const minSettings: SettingsInterface = {
  bufferSize: 1,
  padding: 0.1
};

export class Settings implements SettingsInterface {

  // external settings, have defaults
  startIndex;
  bufferSize;
  padding;
  infinite;
  horizontal;

  // internal settings
  debug = false; // logging; need to turn off in release
  itemIdPrefix = 'ui-scroll-0-'; // todo : scroll instance index ?
  clipAfterFetchOnly = true;
  clipAfterScrollOnly = true;

  constructor(settings?: SettingsInterface) {
    Object.assign(this, defaultSettings);
    assignSettings(this, settings);
  }
}
